import React, { useEffect, useState } from 'react';
import { LogOut, Users, Shield, Clock, RefreshCcw, Trash2, LayoutDashboard, Copy, FileCode, Check } from 'lucide-react';

export default function Dashboard({ token, logout }) {
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, sessionId: null });
    const [copying, setCopying] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, sessionsRes] = await Promise.all([
                fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/sessions', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (sessionsRes.ok) setSessions(await sessionsRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const revokeSession = async () => {
        const sessionId = modal.sessionId;
        setModal({ show: false, sessionId: null });
        try {
            const res = await fetch(`/api/admin/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const copyClientBuild = async () => {
        setCopying(true);
        try {
            const res = await fetch('/api/admin/client-build', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const text = await res.text();
                await navigator.clipboard.writeText(text);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            } else {
                alert("Gagal mengambil build client. Pastikan build sudah dijalankan.");
            }
        } catch (err) {
            console.error(err);
            alert("Error saat menyalin build.");
        } finally {
            setCopying(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 relative">
            {/* Custom Modal */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 scale-in-center transition-all animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Konfirmasi Logout</h3>
                        <p className="text-slate-500 text-center mb-8">
                            Apakah Anda yakin ingin memaksa keluar sesi pengguna ini? Sesi akan langsung dihentikan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setModal({ show: false, sessionId: null })}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={revokeSession}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
                            >
                                Ya, Revoke
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar / Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-2 rounded-lg text-white">
                                <Shield size={24} />
                            </div>
                            <span className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-900 bg-clip-text text-transparent">
                                1affiliate Admin
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchData}
                                className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-full transition-all"
                                title="Refresh Data"
                            >
                                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-4 py-2 rounded-xl font-semibold transition-all border border-transparent hover:border-red-100"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                <Users size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{users.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                                <Clock size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sessions</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{sessions.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                                <LayoutDashboard size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                        </div>
                        <h3 className="text-xl font-bold text-emerald-600">Healthy</h3>
                    </div>
                </div>

                {/* Export Client Build Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                                <FileCode size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Export Client Build</h3>
                                <p className="text-sm text-slate-500">Salin kode HTML client tunggal untuk ditempel di Gemini Canvas.</p>
                            </div>
                        </div>
                        <button
                            onClick={copyClientBuild}
                            disabled={copying}
                            className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${copySuccess
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 hover:-translate-y-0.5'
                                }`}
                        >
                            {copying ? (
                                <RefreshCcw size={18} className="animate-spin" />
                            ) : copySuccess ? (
                                <>
                                    <Check size={18} /> Berhasil Menyalin!
                                </>
                            ) : (
                                <>
                                    <Copy size={18} /> Salin Kode Client
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Users size={20} className="text-primary-600" /> Daftar Pengguna
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">User</th>
                                        <th className="px-6 py-3 font-semibold">Akses</th>
                                        <th className="px-6 py-3 font-semibold">Langganan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {u.email[0].toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-xs font-semibold ${u.subscription_status === 'pro' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                    {u.subscription_status || 'Free'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sessions Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Clock size={20} className="text-primary-600" /> Sesi Aktif
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">User</th>
                                        <th className="px-6 py-3 font-semibold">Kadaluarsa</th>
                                        <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sessions.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {s.app_users?.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(s.expires_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => setModal({ show: true, sessionId: s.id })}
                                                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold text-xs"
                                                >
                                                    <Trash2 size={14} /> Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
