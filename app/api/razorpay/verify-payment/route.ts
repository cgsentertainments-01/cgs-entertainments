// app/api/razorpay/verify-payment/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { isValidUUID } from '@/services/event.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId;
    const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpay_signature = body.razorpay_signature || body.razorpaySignature;
    const registrationId = body.registrationId || body.registration_id;

    console.log('🔔 Verify Razorpay payment request:', { 
      registrationId,
      razorpay_order_id, 
      razorpay_payment_id, 
      hasSignature: !!razorpay_signature 
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, verified: false, error: 'Missing required Razorpay parameters' },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      console.error('❌ Missing RAZORPAY_KEY_SECRET environment variable');
      return NextResponse.json(
        { success: false, verified: false, error: 'Razorpay configuration error' },
        { status: 500 }
      );
    }

    // 1. VERIFY HMAC SIGNATURE
    const isValidSignature = verifyRazorpaySignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValidSignature) {
      console.warn('⚠️ Razorpay payment signature mismatch');
      return NextResponse.json(
        { success: false, verified: false, error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    console.log('✅ Signature verified successfully for order:', razorpay_order_id);

    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    let verifiedPaidAmount: number | undefined = undefined;
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (key_id && key_secret) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
        if (rzpOrder && typeof rzpOrder.amount === 'number') {
          verifiedPaidAmount = Math.round(rzpOrder.amount / 100);
        }
      } catch (rzpErr: any) {
        console.warn('Notice fetching Razorpay order status:', rzpErr?.message || rzpErr);
      }
    }

    // 2. LOCATE EXACT PENDING REGISTRATION RECORD
    let targetRegistration: any = null;

    if (supabase) {
      // Primary lookup by registrationId
      if (registrationId && isValidUUID(registrationId)) {
        const { data: regById } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', registrationId)
          .maybeSingle();
        if (regById) targetRegistration = regById;
      }

      // Secondary lookup via registration_payments table by razorpay_order_id
      if (!targetRegistration && razorpay_order_id) {
        const { data: payRec } = await supabase
          .from('registration_payments')
          .select('registration_id, registrations(*)')
          .eq('razorpay_order_id', razorpay_order_id)
          .maybeSingle();
        if (payRec && payRec.registrations) {
          targetRegistration = payRec.registrations;
        }
      }
    }

    if (!targetRegistration) {
      console.warn(`[VERIFY WARNING] No matching registration found for registrationId="${registrationId}" or order="${razorpay_order_id}"`);
      return NextResponse.json({
        success: true,
        verified: true,
        amount: verifiedPaidAmount,
        razorpay_order_id,
        razorpay_payment_id,
        message: 'Payment signature verified, but registration record not found.',
      });
    }

    const regId = targetRegistration.id;

    // 3. IDEMPOTENCY CHECK: IF ALREADY CONFIRMED AND PAID, RETURN SUCCESS IMMEDIATELY
    if (
      targetRegistration.registration_status === 'confirmed' &&
      targetRegistration.payment_status === 'paid'
    ) {
      console.log(`✅ Registration ID="${regId}" is ALREADY confirmed & paid. Returning idempotent response.`);
      return NextResponse.json({
        success: true,
        verified: true,
        alreadyProcessed: true,
        registrationId: regId,
        registrationNumber: targetRegistration.registration_number,
        amount: targetRegistration.amount,
        message: 'Payment verified (Registration already confirmed)',
      });
    }

    // 4. UPDATE THE EXACT SAME REGISTRATION RECORD TO CONFIRMED
    const paidAmountToStore = verifiedPaidAmount !== undefined ? verifiedPaidAmount : Number(targetRegistration.amount || 0);

    if (supabase && isValidUUID(regId)) {
      const { data: updatedReg, error: updateRegErr } = await supabase
        .from('registrations')
        .update({
          registration_status: 'confirmed',
          payment_status: 'paid',
          amount: paidAmountToStore,
          updated_at: nowIso,
        })
        .eq('id', regId)
        .select('*')
        .single();

      if (updateRegErr) {
        console.error(`❌ Error updating registration status for ${regId}:`, updateRegErr.message);
        return NextResponse.json(
          { success: false, verified: false, error: `Failed to confirm registration status: ${updateRegErr.message}` },
          { status: 500 }
        );
      }

      console.log(`✅ EXACT SAME Registration ID="${regId}" updated to CONFIRMED! Number="${updatedReg.registration_number}"`);

      // 5. UPDATE REGISTRATION PAYMENTS RECORD
      try {
        await supabase.from('registration_payments').upsert({
          registration_id: regId,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          amount: paidAmountToStore,
          currency: 'INR',
          status: 'paid',
          paid_at: nowIso,
          updated_at: nowIso,
        }, { onConflict: 'razorpay_order_id' });
      } catch (payErr: any) {
        console.warn('Notice updating registration_payments:', payErr.message);
      }

      // 6. RECORD FINANCIAL AUDIT TRANSACTION
      try {
        await supabase.from('payment_transactions').insert({
          registration_id: regId,
          transaction_type: 'payment',
          amount: paidAmountToStore,
          currency: 'INR',
          gateway: 'Razorpay',
          gateway_transaction_id: razorpay_payment_id,
          status: 'success',
          gateway_response: { razorpay_order_id, razorpay_payment_id, verified_at: nowIso },
          processed_at: nowIso,
        });
      } catch (txErr: any) {
        console.warn('Notice creating payment_transaction:', txErr.message);
      }

      // 7. SYNC EVENT PARTICIPANT COUNT
      try {
        if (targetRegistration.event_id) {
          const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', targetRegistration.event_id)
            .eq('registration_status', 'confirmed');

          if (count !== null) {
            await supabase
              .from('events')
              .update({ current_participants: count })
              .eq('id', targetRegistration.event_id);
          }
        }
      } catch (cntErr: any) {
        console.warn('Notice updating event participant count:', cntErr.message);
      }

      return NextResponse.json({
        success: true,
        verified: true,
        registrationId: regId,
        registrationNumber: updatedReg.registration_number,
        amount: paidAmountToStore,
        razorpay_order_id,
        razorpay_payment_id,
        message: 'Payment verified and registration confirmed successfully',
      });
    }

    return NextResponse.json({ 
      success: true, 
      verified: true,
      registrationId: regId,
      amount: paidAmountToStore,
      razorpay_order_id,
      razorpay_payment_id,
      message: 'Payment verified successfully'
    });

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      { success: false, verified: false, error: 'Verification failed', details: error.message },
      { status: 500 }
    );
  }
}