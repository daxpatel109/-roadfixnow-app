import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Load variables from the root .env file since the backend folder is nested
dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Init Supabase (using anon key for now since we don't have service_role, but RLS allows backend updates)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Init Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==============================================
// 1. Create Razorpay Order
// ==============================================
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { repair_request_id } = req.body;
    
    // Create a scoped client using the caller's JWT to bypass RLS issues
    const scopedSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: req.headers.authorization || ''
          }
        }
      }
    );

    // 1. Fetch final amount from database (Do not trust frontend)
    const { data: request, error: fetchErr } = await scopedSupabase
      .from('repair_requests')
      .select('amount, customer_id, mechanic_id, status')
      .eq('id', repair_request_id)
      .single();

    if (fetchErr || !request) {
      console.error("Fetch Error:", fetchErr);
      return res.status(404).json({ error: 'Repair request not found' });
    }
    
    if (request.status !== 'payment_pending' && request.status !== 'completed') {
      return res.status(400).json({ error: 'Request is not ready for payment' });
    }

    if (request.payment_status === 'paid') {
      return res.status(400).json({ error: 'Already paid' });
    }

    let finalAmount = request.amount || 0;
    if (finalAmount < 1) {
      finalAmount = 149; // Fallback for testing to prevent Razorpay crashes
    }
    
    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(finalAmount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${repair_request_id.substring(0, 30)}`
    };

    const order = await razorpay.orders.create(options);

    // 3. Store Payment intent in database
    await supabase.from('payments').insert([{
      repair_request_id,
      customer_id: request.customer_id,
      mechanic_id: request.mechanic_id,
      razorpay_order_id: order.id,
      amount: finalAmount,
      payment_status: 'created'
    }]);

    res.json(order);

  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==============================================
// 2. Verify Razorpay Payment (Frontend callback)
// ==============================================
app.post('/api/verify-razorpay-payment', async (req, res) => {
  try {
    const { repair_request_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Verify Signature securely on backend
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Signature is invalid
      await supabase.from('payments')
        .update({ payment_status: 'failed', failure_reason: 'Invalid Signature' })
        .eq('razorpay_order_id', razorpay_order_id);
      
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // 2. Signature valid. Mark Payment Paid.
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (payment.payment_status === 'paid') {
      return res.json({ success: true, message: 'Already verified' });
    }

    await supabase.from('payments').update({
      razorpay_payment_id,
      razorpay_signature,
      payment_status: 'paid',
      paid_at: new Date().toISOString()
    }).eq('id', payment.id);

    // 3. Update Repair Request
    await supabase.from('repair_requests').update({
      payment_status: 'paid',
      status: 'settlement_pending' // Transition to waiting for admin to pay mechanic
    }).eq('id', repair_request_id);

    // 4. Calculate Commission & Insert Settlement
    const platform_commission = payment.amount * 0.15;
    const mechanic_payout = payment.amount - platform_commission;

    await supabase.from('settlements').insert([{
      repair_request_id: payment.repair_request_id,
      payment_id: payment.id,
      mechanic_id: payment.mechanic_id,
      gross_amount: payment.amount,
      platform_commission,
      mechanic_payout,
      settlement_status: 'pending'
    }]);

    res.json({ success: true });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==============================================
// 3. Razorpay Webhook (Backup Verification)
// ==============================================
app.post('/api/razorpay-webhook', async (req, res) => {
  // Normally you'd parse raw body for webhook verification, but we use express.json
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      // Look up payment
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single();

      if (payment && payment.payment_status !== 'paid') {
        // Mark paid via webhook if frontend failed
        await supabase.from('payments').update({
          razorpay_payment_id: paymentEntity.id,
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        }).eq('id', payment.id);

        await supabase.from('repair_requests').update({
          payment_status: 'paid',
          status: 'settlement_pending'
        }).eq('id', payment.repair_request_id);

        const platform_commission = payment.amount * 0.15;
        const mechanic_payout = payment.amount - platform_commission;

        // Ensure settlement doesn't already exist
        const { data: existingSettlement } = await supabase
          .from('settlements')
          .select('id')
          .eq('payment_id', payment.id)
          .single();

        if (!existingSettlement) {
          await supabase.from('settlements').insert([{
            repair_request_id: payment.repair_request_id,
            payment_id: payment.id,
            mechanic_id: payment.mechanic_id,
            gross_amount: payment.amount,
            platform_commission,
            mechanic_payout,
            settlement_status: 'pending'
          }]);
        }
      }
    }

    res.json({ status: 'ok' });

  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("Server Error");
  }
});

// ==============================================
// 4. Abandoned Request Sweeper (Cron Loop)
// ==============================================
const sweepAbandonedRequests = async () => {
  try {
    // 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();

    // Fetch requests stuck in searching
    const { data: stuckRequests, error } = await supabase
      .from('repair_requests')
      .select('id')
      .eq('status', 'searching')
      .is('mechanic_id', null)
      .lt('created_at', fiveMinutesAgo);

    if (error) throw error;

    if (stuckRequests && stuckRequests.length > 0) {
      console.log(`[Sweeper] Found ${stuckRequests.length} stuck requests to cancel.`);
      
      const ids = stuckRequests.map(r => r.id);

      // Cancel the requests
      await supabase
        .from('repair_requests')
        .update({ status: 'cancelled' })
        .in('id', ids);

      // Expire related dispatch attempts
      await supabase
        .from('dispatch_attempts')
        .update({ status: 'expired' })
        .in('repair_request_id', ids)
        .eq('status', 'sent');
        
      console.log(`[Sweeper] Cancelled requests: ${ids.join(', ')}`);
    }
  } catch (err) {
    console.error('[Sweeper Error]:', err);
  }
};

// Run sweeper every 1 minute
setInterval(sweepAbandonedRequests, 60000);
console.log("[Sweeper] Started background cron sweeper...");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Secure Payment Server running on port ${PORT}`);
});
