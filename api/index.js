import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { repair_request_id } = req.body;
    const scopedSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: req.headers.authorization || '' }
        }
      }
    );

    const { data: request, error: fetchErr } = await scopedSupabase
      .from('repair_requests')
      .select('amount, customer_id, mechanic_id, status')
      .eq('id', repair_request_id)
      .single();

    if (fetchErr || !request) return res.status(404).json({ error: 'Repair request not found' });
    if (request.status !== 'payment_pending' && request.status !== 'completed') return res.status(400).json({ error: 'Request is not ready for payment' });
    if (request.payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });

    let finalAmount = request.amount || 0;
    if (finalAmount < 1) finalAmount = 149;
    
    const options = {
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `receipt_${repair_request_id.substring(0, 30)}`
    };

    const order = await razorpay.orders.create(options);

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
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/verify-razorpay-payment', async (req, res) => {
  try {
    const { repair_request_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await supabase.from('payments')
        .update({ payment_status: 'failed', failure_reason: 'Invalid Signature' })
        .eq('razorpay_order_id', razorpay_order_id);
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    if (payment.payment_status === 'paid') return res.json({ success: true, message: 'Already verified' });

    await supabase.from('payments').update({
      razorpay_payment_id,
      razorpay_signature,
      payment_status: 'paid',
      paid_at: new Date().toISOString()
    }).eq('id', payment.id);

    await supabase.from('repair_requests').update({
      payment_status: 'paid',
      status: 'settlement_pending'
    }).eq('id', repair_request_id);

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
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/razorpay-webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) return res.status(400).send('Invalid signature');

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single();

      if (payment && payment.payment_status !== 'paid') {
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
    res.status(500).send("Server Error");
  }
});

export default app;
