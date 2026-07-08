import { formatCurrency, formatIDR } from "../lib/currency";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function RealtimeDashboard() {
  const [stats, setStats] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    function connect() {
      const es = new EventSource(`/api/admin/stats/stream?token=${token}`);
      eventSourceRef.current = es;

      es.onopen = () => setConnected(true);

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
        es.close();
        setTimeout(connect, 3000);
      };
    }

    connect();

    return () => { eventSourceRef.current?.close(); };
  }, []);

  const formatNum = (n) => Number(n || 0).toLocaleString();
  const formatRp = (n) => formatIDR(n || 0);

  // Map history to chart-friendly shape
  const chartData = history.map(h => ({
    t: new Date(h.t).toLocaleTimeString(),
    clicks: Number(h.clicks_1h || 0),
    conversions: Number(h.conversions_1h || 0),
    revenue: Number(h.revenue_1h || 0),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Real-Time Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clicks (1h)', key: 'clicks_1h', format: formatNum },
          { label: 'Conversions (1h)', key: 'conversions_1h', format: formatNum },
          { label: 'Revenue (1h)', key: 'revenue_1h', format: formatRp },
          { label: 'Active Campaigns', key: 'active_campaigns', format: formatNum },
        ].map(({ label, key, format }) => (
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
          </GlassCard>
        ))}
      </div>

      {/* Clicks + Conversions dual-line chart */}
      <GlassCard>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Clicks &amp; Conversions (rolling 60 pts)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="t"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              interval="preserveStartEnd"
              tickFormatter={(v) => v}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} width={36} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0', fontSize: 11 }}
              itemStyle={{ fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorClicks)"
              dot={false}
              name="Clicks"
            />
            <Area
              type="monotone"
              dataKey="conversions"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#colorConversions)"
              dot={false}
              name="Conversions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Revenue area chart */}
      <GlassCard>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Revenue (1h, rolling 60 pts)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="t"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              interval="preserveStartEnd"
              tickFormatter={(v) => v}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} width={48} tickFormatter={(v) => formatIDR(v)} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0', fontSize: 11 }}
              itemStyle={{ fontSize: 11 }}
              formatter={(v) => formatRp(v)}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              dot={false}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Misc stats row */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <div className="text-xs text-gray-400 mb-1">Pending Postbacks</div>
          <div className="text-xl font-bold text-white">{formatNum(stats?.pending_postbacks)}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-gray-400 mb-1">Last Update</div>
          <div className="text-sm text-gray-300">{stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : '—'}</div>
        </GlassCard>
      </div>

      {/* Live event stream log */}
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
