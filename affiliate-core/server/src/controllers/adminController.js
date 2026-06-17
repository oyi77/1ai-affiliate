const supabase = require('../db/supabase');
const fs = require('fs');
const path = require('path');

const getUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('app_users')
            .select('id, email, role, created_at, subscription_status'); // safely select fields

        if (error) throw error;
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const { data, error } = await supabase
            .from('app_users')
            .insert([{ email, password, role: role || 'user' }]) // Remember to hash password in production!
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getActiveSessions = async (req, res) => {
    try {
        const { data: sessions, error } = await supabase
            .from('active_sessions')
            .select('*, app_users(email)');

        if (error) throw error;
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const revokeSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const { error } = await supabase
            .from('active_sessions')
            .delete()
            .eq('id', sessionId);

        if (error) throw error;
        res.json({ message: 'Session revoked' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getClientBuild = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../../public/client/index.html');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Client build not found. Please run build script first.' });
        }
        const content = fs.readFileSync(filePath, 'utf8');
        res.type('text/plain').send(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    getActiveSessions,
    revokeSession,
    getClientBuild
};
