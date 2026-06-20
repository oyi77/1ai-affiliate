import { formatCurrency, formatIDR } from "../lib/currency";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';

export function RealtimeDashboard() {
  const [stats, setStats] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const es = new EventSource(`/api/admin/stats/stream?token=${token}`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setStats(data);
        setConnected(true);
        setHistory(h => [...h.slice(-59), { ...data, t: Date.now() }]); // Keep last 60 points
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
      setTimeout(() => {
        // Reconnect after 3s
        const newEs = new EventSource(`/api/admin/stats/stream?token=${token}`);
        eventSourceRef.current = newEs;
      }, 3000);
    };

    return () => { es.close(); };
  }, []);

  const formatNum = (n) => Number(n || 0).toLocaleString();
  const formatRp = (n) => formatIDR(n || 0);

  // Simple sparkline from history
  const sparkline = (key, color) => {
    const values = history.map(h => Number(h[key] || 0));
    if (values.length < 2) return null;
    const max = Math.max(...values, 1);
    const points = values.map((v, i) => `${(i / (values.length - 1)) * 200},${40 - (v / max) * 35}`).join(' ');
    return (
      <svg viewBox="0 0 200 40" className="w-full h-10 mt-2">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Real-Time Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clicks (1h)', key: 'clicks_1h', color: '#6366f1', format: formatNum },
          { label: 'Conversions (1h)', key: 'conversions_1h', color: '#10b981', format: formatNum },
          { label: 'Revenue (1h)', key: 'revenue_1h', color: '#f59e0b', format: formatIDR },
          { label: 'Active Affiliates', key: 'active_affiliates', color: '#8b5cf6', format: formatNum },
        ].map(({ label, key, color, format }) => (
          <GlassCard key={key}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <motion.div
              key={stats?.[key]}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              {format(stats?.[key])}
            </motion.div>
            {sparkline(key, color)}
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <div className="text-xs text-gray-400 mb-1">Pending Postbacks</div>
          <div className="text-xl font-bold text-white">{formatNum(stats?.pending_postbacks)}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-gray-400 mb-1">Last Update</div>
          <div className="text-sm text-gray-300">{stats?.timestamp ? new Date(stats.timestamp * 1000).toLocaleTimeString() : '—'}</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Live Event Stream</h3>
        <div className="h-48 overflow-y-auto font-mono text-xs text-gray-500 space-y-1">
          {history.slice().reverse().map((h, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-gray-600">{new Date(h.t).toLocaleTimeString()}</span>
              <span className="text-indigo-400">{h.clicks_1h} clicks</span>
              <span className="text-emerald-400">{h.conversions_1h} conv</span>
              <span className="text-amber-400">{formatRp(h.revenue_1h)}</span>
            </div>
          ))}
          {history.length === 0 && <div className="text-gray-600">Waiting for data...</div>}
        </div>
      </GlassCard>
    </div>
  );
}
