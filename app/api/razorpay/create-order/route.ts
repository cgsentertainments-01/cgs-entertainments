// app/api/razorpay/create-order/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStoreEvents } from '@/lib/events-store';
import { transformDbEvent } from '@/services/event.service';
import { getDefaultFormConfig } from '@/types/event-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, items, receipt, customerName, email, phone, userId, eventId, compType, participationTypeId, numParticipants } = body;
    
    console.log('🔔 Create Razorpay order request:', { 
      amount,
      itemsCount: items?.length, 
      customerName,
      email,
      eventId,
      compType,
      participationTypeId
    });

    let finalAmount = 0;
    let eventValidated = false;

    // 1. Authoritative Event + Participation Type Fee Validation
    if (eventId) {
      const supabase = getSupabaseAdmin();
      let eventRecord: any = null;

      if (supabase) {
        try {
          const { data } = await supabase
            .from('events')
            .select('*')
            .or(`id.eq.${eventId},slug.eq.${eventId}`)
            .maybeSingle();
          if (data) eventRecord = data;
        } catch (e) {
          console.warn('Supabase event fetch notice in create-order:', e);
        }
      }

      if (!eventRecord) {
        const storeEvents = getStoreEvents();
        eventRecord = storeEvents.find((e) => String(e.id) === String(eventId) || e.slug === eventId);
      }

      if (eventRecord) {
        const event = transformDbEvent(eventRecord);
        const formConfig = event.form_config || getDefaultFormConfig(event.category);
        const partTypes = formConfig.participationTypes || [];

        // Match participation type by ID or Name (case insensitive)
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
          eventValidated = true;
          console.log(`✅ Authoritative fee validated from participation type '${matchedType.name}': ₹${finalAmount}`);
        } else if (typeof event.registration_fee === 'number') {
          finalAmount = event.registration_fee;
          eventValidated = true;
          console.log(`✅ Authoritative fee validated from event base registration fee: ₹${finalAmount}`);
        }
      }
    }

    if (!eventValidated) {
      if (typeof amount === 'number' && amount >= 0) {
        finalAmount = amount;
      } else if (items && Array.isArray(items) && items.length > 0) {
        finalAmount = items.reduce((sum: number, item: any) => {
          const itemPrice = item.sellingPrice ?? item.discountedPrice ?? item.price ?? 0;
          return sum + (itemPrice * (item.quantity || 1));
        }, 0);
      }
    }

    // Validate final amount
    if (finalAmount < 0) {
      console.error('❌ Invalid final amount:', finalAmount);
      return NextResponse.json(
        { success: false, error: "Invalid final amount" },
        { status: 400 }
      );
    }

    // Get Razorpay credentials
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('🔑 Razorpay credentials check:', {
      hasKeyId: !!key_id,
      hasKeySecret: !!key_secret,
      keyIdPrefix: key_id ? key_id.substring(0, 8) : 'none'
    });
    
    if (!key_id || !key_secret) {
      console.error('❌ Razorpay credentials missing');
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration error', details: 'Missing API keys' },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({ 
      key_id, 
      key_secret 
    });

    const amountInPaise = Math.round(finalAmount * 100);

    // Create order
    const order = await razorpay.orders.create({
      amount: amountInPaise, // Convert to paise
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        customerName: customerName || '',
        email: email || '',
        phone: phone || '',
        eventId: eventId || '',
        compType: compType || ''
      }
    });
    
    console.log('✅ Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

    // Return the Razorpay order
    return NextResponse.json({
      success: true,
      id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id
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