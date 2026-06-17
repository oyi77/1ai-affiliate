const crypto = require('crypto');
const supabase = require('../db/supabase');

const tripayConfig = {
    apiKey: process.env.TRIPAY_API_KEY,
    privateKey: process.env.TRIPAY_PRIVATE_KEY,
    merchantCode: process.env.TRIPAY_MERCHANT_CODE,
    endpoint: 'https://tripay.co.id/api-sandbox/transaction/create' // Use sandbox for now
};

const createTransaction = async (req, res) => {
    const { amount, paymentMethod } = req.body;
    const user = req.user;

    if (!amount || !paymentMethod) {
        return res.status(400).json({ error: 'Amount and Payment Method required' });
    }

    try {
        const merchantRef = 'REF-' + Date.now();
        const signature = crypto.createHmac('sha256', tripayConfig.privateKey)
            .update(tripayConfig.merchantCode + merchantRef + amount)
            .digest('hex');

        const payload = {
            method: paymentMethod,
            merchant_ref: merchantRef,
            amount: amount,
            customer_name: user.email, // using email as name for simplicity
            customer_email: user.email,
            order_items: [
                {
                    sku: 'SUBSCRIPTION',
                    name: 'Premium Subscription',
                    price: amount,
                    quantity: 1
                }
            ],
            return_url: 'https://your-domain.com/payment/success',
            expired_time: (Math.floor(Date.now() / 1000) + 24 * 60 * 60), // 24 hours
            signature: signature
        };

        // Need axios or fetch. using fetch (node 18+)
        const response = await fetch(tripayConfig.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + tripayConfig.apiKey
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        // Save transaction to DB
        const { error: dbError } = await supabase
            .from('transactions')
            .insert([{
                user_id: user.id,
                reference: result.data.reference,
                amount: amount,
                status: 'UNPAID',
                tripay_reference: result.data.reference
            }]);

        if (dbError) console.error('DB Error saving transaction:', dbError);

        res.json(result);

    } catch (err) {
        console.error('Tripay Create Error:', err);
        res.status(500).json({ error: err.message });
    }
};

const handleCallback = async (req, res) => {
    // Verify callback signature
    const signature = req.headers['x-callback-signature'];
    const event = req.headers['x-callback-event'];

    if (event !== 'payment_status') {
        return res.json({ success: true }); // Ignore other events
    }

    // TODO: Validate signature (omitted for brevity, but crucial for production)

    const data = req.body;
    const { reference, status } = data;

    if (status === 'PAID') {
        // Update Transaction
        await supabase.from('transactions')
            .update({ status: 'PAID' })
            .eq('tripay_reference', reference);

        // Update User Subscription?
        // find transaction to get user_id
        const { data: trx } = await supabase.from('transactions').select('user_id').eq('tripay_reference', reference).single();
        if (trx) {
            await supabase.from('app_users').update({ subscription_status: 'active' }).eq('id', trx.user_id);
        }
    }

    res.json({ success: true });
};

module.exports = {
    createTransaction,
    handleCallback
};
