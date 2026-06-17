const supabase = require('../db/supabase');
const crypto = require('crypto');

// Helper to generate a random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const REGISTRATION_FEE = 50000; // Example fee, set via ENV in production

const register = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        // 1. Create User (Pending/Inactive)
        // Check if exists
        const { data: existing } = await supabase.from('app_users').select('id').eq('email', email).single();
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const { data: user, error: userError } = await supabase
            .from('app_users')
            .insert([{
                email,
                password,
                role: 'user',
                subscription_status: 'inactive'
            }])
            .select()
            .single();

        if (userError) throw userError;

        // 2. Generate Tripay Transaction (QRIS)
        // We can reuse paymentController logic or call it here. 
        // For simplicity, let's call the payment logic helper directly if refactored, 
        // or just fetch the Tripay API here.

        // We need to import the payment logic or duplicate it. 
        // Let's import the helper if possible, but paymentController exports handlers.
        // Let's just duplicate the Tripay call for now or refactor `createTransaction` to be reusable.
        // I will duplicate for speed and clarity in this context.

        const tripayConfig = {
            apiKey: process.env.TRIPAY_API_KEY,
            privateKey: process.env.TRIPAY_PRIVATE_KEY,
            merchantCode: process.env.TRIPAY_MERCHANT_CODE,
            endpoint: 'https://tripay.co.id/api-sandbox/transaction/create'
        };

        const merchantRef = 'REG-' + Date.now();
        const signature = crypto.createHmac('sha256', tripayConfig.privateKey)
            .update(tripayConfig.merchantCode + merchantRef + REGISTRATION_FEE)
            .digest('hex');

        const payload = {
            method: 'QRIS', // Force QRIS for registration as requested
            merchant_ref: merchantRef,
            amount: REGISTRATION_FEE,
            customer_name: email,
            customer_email: email,
            order_items: [{ sku: 'REG', name: 'Registration Fee', price: REGISTRATION_FEE, quantity: 1 }],
            return_url: 'https://your-domain.com/payment/success',
            expired_time: (Math.floor(Date.now() / 1000) + 24 * 60 * 60),
            signature: signature
        };

        // Use fetch
        const response = await fetch(tripayConfig.endpoint, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + tripayConfig.apiKey },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        // 3. Save Transaction
        await supabase.from('transactions').insert([{
            user_id: user.id,
            reference: result.data.reference,
            amount: REGISTRATION_FEE,
            status: 'UNPAID',
            tripay_reference: result.data.reference
        }]);

        // Return QRIS Data
        res.json({
            message: 'Registration successful. Please pay to activate.',
            payment: {
                reference: result.data.reference,
                amount: result.data.amount,
                qr_url: result.data.qr_url, // Tripay usually returns this for QRIS
                checkout_url: result.data.checkout_url
            }
        });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        // 1. Verify User credentials (assuming we store users in a 'users' table or use Supabase Auth)
        // For this custom single-session logic, we might use a custom 'app_users' table if we want full control,
        // OR use Supabase Auth `signInWithPassword` and then manage the session in a custom table.
        // Let's go with custom 'app_users' table for full control over the session logic as requested.

        const { data: user, error: userError } = await supabase
            .from('app_users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // In production, hash this!
            .single();

        if (userError || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Single Session Enforcement: Invalidate old sessions
        const { error: deleteError } = await supabase
            .from('active_sessions')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Error clearing old sessions:', deleteError);
        }

        // 3. Create New Session
        const token = generateToken();
        const { error: sessionError } = await supabase
            .from('active_sessions')
            .insert([
                {
                    user_id: user.id,
                    token: token,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
                }
            ]);

        if (sessionError) {
            console.error('Error creating session:', sessionError);
            return res.status(500).json({ error: 'Failed to create session' });
        }

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        await supabase.from('active_sessions').delete().eq('token', token);
    }
    res.json({ message: 'Logged out' });
};

const getMe = async (req, res) => {
    // Configured by middleware
    res.json({ user: req.user });
};

module.exports = {
    login,
    logout,
    getMe,
    register
};
