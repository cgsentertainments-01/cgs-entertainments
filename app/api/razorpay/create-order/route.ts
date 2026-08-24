// app/api/razorpay/create-order/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStoreEvents } from '@/lib/events-store';
import { transformDbEvent, normalizeEventIdentifier, isValidUUID } from '@/services/event.service';
import { getDefaultFormConfig } from '@/types/event-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      registrationId,
      amount,
      items,
      receipt,
      customerName,
      email,
      phone,
      userId,
      eventId,
      compType,
      participationTypeId,
      numParticipants,
    } = body;

    console.log('🔔 Create Razorpay order request:', { 
      registrationId,
      amount,
      customerName,
      email,
      eventId,
      compType,
      participationTypeId
    });

    const supabase = getSupabaseAdmin();
    let finalAmount = 0;
    let registrationRecord: any = null;
    let validated = false;

    // 1. PRIMARY AUTHORITATIVE SOURCE: FETCH EXISTING PENDING REGISTRATION
    if (registrationId && supabase) {
      try {
        const { data: reg, error: regErr } = await supabase
          .from('registrations')
          .select('*, events(id, title), participants(id, full_name, email, phone)')
          .eq('id', registrationId)
          .maybeSingle();

        if (regErr) {
          console.warn('Notice querying pending registration in create-order:', regErr.message);
        }

        if (reg) {
          registrationRecord = reg;
          finalAmount = Number(reg.amount || 0);
          validated = true;
          console.log(`✅ Authoritative amount fetched from pending registration ID="${reg.id}": ₹${finalAmount}`);
        }
      } catch (e: any) {
        console.warn('Exception querying registration in create-order:', e.message);
      }
    }

    // 2. SECONDARY AUTHORITATIVE SOURCE: FETCH EVENT & FORM CONFIG FEE
    if (!validated) {
      const cleanEventId = normalizeEventIdentifier(eventId);
      if (cleanEventId) {
        let eventRecord: any = null;
        const isUUID = isValidUUID(cleanEventId);

        if (supabase) {
          try {
            let query = supabase.from('events').select('*');
            if (isUUID) {
              query = query.eq('id', cleanEventId);
            } else {
              query = query.eq('slug', cleanEventId);
            }
            const { data } = await query.maybeSingle();
            if (data) eventRecord = data;
          } catch (e) {
            console.warn('Supabase event fetch notice in create-order:', e);
          }
        }

        if (!eventRecord) {
          const storeEvents = getStoreEvents();
          eventRecord = storeEvents.find(
            (e) => String(e.id).toLowerCase() === cleanEventId.toLowerCase() || (e.slug && e.slug.toLowerCase() === cleanEventId.toLowerCase())
          );
        }

        if (eventRecord) {
          const event = transformDbEvent(eventRecord);
          const formConfig = event.form_config || getDefaultFormConfig(event.category, event.registration_fee);
          const partTypes = formConfig.participationTypes || [];

          const targetTypeIdentifier = String(participationTypeId || compType || '').trim().toLowerCase();
          const matchedType = partTypes.find(
            (pt) =>
              pt.isActive !== false &&
              (String(pt.id).toLowerCase() === targetTypeIdentifier ||
                pt.name.toLowerCase() === targetTypeIdentifier ||
                pt.name.toLowerCase().includes(targetTypeIdentifier) ||
                targetTypeIdentifier.includes(pt.name.toLowerCase()))
          );

          if (matchedType) {
            finalAmount = matchedType.fee;
            validated = true;
            console.log(`✅ Authoritative fee validated from event participation type '${matchedType.name}': ₹${finalAmount}`);
          } else if (typeof event.registration_fee === 'number') {
            finalAmount = event.registration_fee;
            validated = true;
            console.log(`✅ Authoritative fee validated from event base fee: ₹${finalAmount}`);
          }
        }
      }
    }

    if (!validated) {
      if (typeof amount === 'number' && amount >= 0) {
        finalAmount = amount;
        validated = true;
      } else {
        console.error('❌ Could not validate authoritative fee for order creation.');
        return NextResponse.json(
          { success: false, error: "Event or pending registration record not found." },
          { status: 400 }
        );
      }
    }

    if (finalAmount < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Free Event Check
    if (finalAmount === 0) {
      return NextResponse.json({
        success: true,
        isFree: true,
        id: `free_ord_${Date.now()}`,
        orderId: `free_ord_${Date.now()}`,
        amount: 0,
        currency: 'INR',
      });
    }

    // Get Razorpay credentials
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      console.error('❌ Razorpay credentials missing');
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration error', details: 'Missing API keys' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const amountInPaise = Math.round(finalAmount * 100);

    const orderReceipt = receipt || `rcpt_reg_${registrationId || Date.now()}`;

    // Create Razorpay order with registrationId in notes
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderReceipt,
      notes: {
        registrationId: registrationId || '',
        customerName: customerName || registrationRecord?.participants?.full_name || '',
        email: email || registrationRecord?.participants?.email || '',
        phone: phone || registrationRecord?.participants?.phone || '',
        eventId: eventId || registrationRecord?.event_id || '',
        compType: compType || registrationRecord?.participation_type || '',
      }
    });

    console.log('✅ Razorpay order created successfully for registration:', {
      orderId: order.id,
      registrationId,
      amount: order.amount,
    });

    // Record order association in DB
    if (registrationId && supabase && isValidUUID(registrationId)) {
      try {
        await supabase.from('registration_payments').upsert({
          registration_id: registrationId,
          razorpay_order_id: order.id,
          amount: finalAmount,
          currency: 'INR',
          status: 'created',
          created_at: new Date().toISOString(),
        }, { onConflict: 'razorpay_order_id' });
      } catch (payInsErr) {
        console.warn('Notice saving order to registration_payments:', payInsErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
      registrationId: registrationId || null,
    });
  } catch (error: any) {
    console.error('❌ Create order error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create order', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}