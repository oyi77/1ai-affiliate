const supabase = require('../db/supabase');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Check if session exists and is valid
        const { data: session, error } = await supabase
            .from('active_sessions')
            .select('*, app_users(*)')
            .eq('token', token)
            .single();

        if (error || !session) {
            return res.status(401).json({ error: 'Invalid or expired session. You may have logged in elsewhere.' });
        }

        // Check expiration
        if (new Date(session.expires_at) < new Date()) {
            // Clean up expired
            await supabase.from('active_sessions').delete().eq('token', token);
            return res.status(401).json({ error: 'Session expired' });
        }

        // Attach user to request
        req.user = session.app_users;
        req.sessionId = session.id;
        next();

    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authenticate;
