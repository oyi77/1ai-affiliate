const crypto = require('crypto');
const pool = require('../db/mysql');

const tripayConfig = {
  apiKey: process.env.TRIPAY_API_KEY,
  privateKey: process.env.TRIPAY_PRIVATE_KEY,
  merchantCode: process.env.TRIPAY_MERCHANT_CODE,
  endpoint: process.env.TRIPAY_ENDPOINT || 'https://tripay.co.id/api/transaction/create',
};

async function createTransaction(req, res) {
  const { amount, paymentMethod } = req.body;
  if (!amount || !paymentMethod) {
    return res.status(400).json({ error: 'Amount and payment method required' });
  }

  try {
    const merchantRef = 'PAY-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const rawSignature = tripayConfig.merchantCode + merchantRef + parseInt(amount);
    const signature = crypto.createHmac('sha256', tripayConfig.privateKey)
      .update(rawSignature)
      .digest('hex');

    const payload = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      amount: parseInt(amount),
      customer_name: req.user.email || 'User',
      customer_email: req.user.email,
      order_items: [{ sku: 'SUB', name: 'Subscription', price: parseInt(amount), quantity: 1 }],
      return_url: process.env.PAYMENT_RETURN_URL || 'https://1ai-affiliate.fly.dev/payment/success',
      expired_time: Math.floor(Date.now() / 1000) + 86400,
      signature,
    };

    const resp = await fetch(tripayConfig.endpoint, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tripayConfig.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await resp.json();
    if (!result.success) throw new Error(result.message);

    await pool.query(
      `INSERT INTO affiliate_payments (user_id, reference, amount, status, tripay_ref, created_at)
       VALUES (?, ?, ?, 'UNPAID', ?, UNIX_TIMESTAMP())`,
      [req.user.id, result.data.reference, amount, result.data.reference]
    );

    res.json({
      reference: result.data.reference,
      amount: result.data.amount,
      qr_url: result.data.qr_url,
      checkout_url: result.data.checkout_url,
    });
  } catch (err) {
    console.error('Tripay error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function handleCallback(req, res) {
  const event = req.headers['x-callback-event'];
  if (event !== 'payment_status') return res.json({ success: true });

  const { reference, status } = req.body;
  if (status === 'PAID') {
    await pool.query(
      `UPDATE affiliate_payments SET status = 'PAID', paid_at = UNIX_TIMESTAMP()
       WHERE tripay_ref = ?`,
      [reference]
    );

    const [rows] = await pool.query(
      'SELECT user_id FROM affiliate_payments WHERE tripay_ref = ?',
      [reference]
    );
    if (rows.length > 0) {
      await pool.query(
        `UPDATE affiliates SET tier = 'premium', updated_at = UNIX_TIMESTAMP()
         WHERE user_id = ?`,
        [rows[0].user_id]
      );
    }
  }

  res.json({ success: true });
}

module.exports = { createTransaction, handleCallback };
