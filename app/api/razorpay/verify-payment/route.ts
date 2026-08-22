// app/api/razorpay/verify-payment/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { verifyRazorpaySignature } from '@/lib/razorpay';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId;
    const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpay_signature = body.razorpay_signature || body.razorpaySignature;
    const { userId, orderPayload, items } = body;

    console.log('🔔 Verify Razorpay payment request:', { 
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

    // Verify Razorpay signature using HMAC-SHA256
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

    // Fetch Razorpay order details via SDK if available for extra security check
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (key_id && key_secret) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
        console.log('✅ Fetched Razorpay order status:', (rzpOrder as any)?.status);
      } catch (rzpErr: any) {
        console.warn('Notice fetching Razorpay order status:', rzpErr?.message || rzpErr);
      }
    }

    // Optional store order handling if orderPayload and items exist (for e-commerce store flow)
    if (orderPayload && items && supabase) {
      try {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, order_number')
          .or(`razorpay_payment_id.eq.${razorpay_payment_id},razorpay_order_id.eq.${razorpay_order_id}`)
          .maybeSingle();

        if (existingOrder) {
          console.log('Existing store order found in database:', existingOrder);
          return NextResponse.json({ 
            success: true, 
            verified: true,
            message: 'Payment verified (Order already processed)',
            order_id: existingOrder.id,
            order_number: existingOrder.order_number
          });
        }
      } catch (e: any) {
        console.warn('Notice checking store order existence:', e?.message || e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      verified: true,
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