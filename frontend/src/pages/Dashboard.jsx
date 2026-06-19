import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { MousePointer, TrendingUp, DollarSign, ShoppingCart, Users, Activity } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { useStats } from '../hooks/useStats';
import { useClicks } from '../hooks/useClicks';
import { useCampaigns } from '../hooks/useCampaigns';
import { OnboardingWizard } from '../components/OnboardingWizard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Derives a 7-point sparkline from a current value and a period-over-period
 * change ratio. The series ends at `current` and grows/shrinks linearly back
 * from `current / (1 + changeRatio)` at point 0.
 *
 * All values are floored at 0 so negative counts never appear.
 */
function deriveSparkline(current, changeRatio, points = 7) {
  const safeRatio = isFinite(changeRatio) ? changeRatio : 0;
  const previous = current / (1 + safeRatio) || 0;
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    return Math.max(0, previous + (current - previous) * t);
  });
}

function formatCurrency(amount) {
  const num = Number(amount);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Dashboard() {
  const [range, setRange] = useState('30d');
  const { data: stats, isLoading: statsLoading } = useStats('admin');
  const { data: clicksResult, isLoading: clicksLoading } = useClicks(5);
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(10);
  const { data: dailyData = [] } = useQuery({
    queryKey: ['daily-stats', range],
    queryFn: async () => {
      const res = await api.get(`/api/admin/stats/daily?range=${range}`);
      return res.data?.data ?? [];
    },
  });

  const recentClicks = clicksResult?.data ?? [];

  // Sort campaigns by revenue desc, then clicks desc
  const topCampaigns = campaigns
    ? [...campaigns].sort((a, b) => Number(b.revenue) - Number(a.revenue) || Number(b.clicks) - Number(a.clicks)).slice(0, 5)
    : [];

  const clickChange = stats?.clickChange ?? 0;
  const revenueGrowth = stats?.revenueGrowth ?? 0;

  const metrics = [
    {
      label: 'Affiliates',
      value: stats?.totalAffiliates?.toLocaleString() ?? '0',
      change: { value: stats?.newAffiliates7d ?? 0, direction: (stats?.newAffiliates7d ?? 0) > 0 ? 'up' : 'flat', vsLabel: 'new this week' },
      sparkline: deriveSparkline(stats?.totalAffiliates ?? 0, 0.05),
      accent: 'indigo',
      icon: Users,
    },
    {
      label: 'Clicks (24h)',
      value: stats?.clicks24h?.toLocaleString() ?? '0',
      change: {
        value: Math.abs(Math.round(clickChange * 100)),
        direction: clickChange > 0 ? 'up' : clickChange < 0 ? 'down' : 'flat',
        vsLabel: 'vs prev 24h',
      },
      sparkline: deriveSparkline(stats?.clicks24h ?? 0, clickChange),
      accent: 'blue',
      icon: MousePointer,
    },
    {
      label: 'Conversions',
      value: stats?.attributed_conversions?.toLocaleString() ?? '0',
      change: { value: stats?.avg_ctr ?? 0, direction: (stats?.avg_ctr ?? 0) > 0 ? 'up' : 'flat', vsLabel: 'CTR %' },
      sparkline: deriveSparkline(stats?.attributed_conversions ?? 0, revenueGrowth),
      accent: 'green',
      icon: TrendingUp,
    },
    {
      label: 'Revenue MTD',
      value: formatCurrency(stats?.revenueMtd ?? 0),
      change: {
        value: Math.abs(Math.round(revenueGrowth * 100)),
        direction: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'flat',
        vsLabel: 'vs last month',
      },
      sparkline: deriveSparkline(stats?.revenueMtd ?? 0, revenueGrowth),
      accent: 'green',
      icon: DollarSign,
    },
    {
      label: 'Avg EPC',
      value: `$${Number(stats?.avg_epc ?? 0).toFixed(4)}`,
      change: { value: Number((stats?.avg_ctr ?? 0).toFixed(1)), direction: (stats?.avg_epc ?? 0) > 0 ? 'up' : 'flat', vsLabel: 'avg CTR' },
      sparkline: deriveSparkline(stats?.avg_epc ?? 0, clickChange),
      accent: 'yellow',
      icon: ShoppingCart,
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 bg-surface-2/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 bg-surface-2/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OnboardingWizard />
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Performance Chart */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Performance Over Time</h3>
          <div className="flex gap-1">
            {['7d', '30d', '90d'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  range === r
                    ? 'bg-indigo-primary text-white'
                    : 'bg-surface-3 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {dailyData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={v => {
                  const d = new Date(v);
                  return `${d.getMonth()+1}/${d.getDate()}`;
                }}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={2} dot={false} name="Clicks" />
              <Line type="monotone" dataKey="conversions" stroke="#34d399" strokeWidth={2} dot={false} name="Conversions" />
              <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} dot={false} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity — live from /api/admin/clicks */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          {clicksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-surface-2/50 rounded animate-pulse" />
              ))}
            </div>
          ) : recentClicks.length === 0 ? (
            <p className="text-slate-400 text-sm">No clicks recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentClicks.map((click) => (
                <li key={click.click_id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${click.converted ? 'bg-green-500' : 'bg-slate-500'}`} />
                    <span className="text-slate-300 truncate max-w-[160px]">
                      {click.offer_name ?? `Offer #${click.offer_id}`}
                    </span>
                    <span className="text-slate-500 text-xs flex-shrink-0">{click.country_code}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    {click.payout > 0 && (
                      <span className="text-green-400 text-xs font-medium">{formatCurrency(click.payout)}</span>
                    )}
                    <span className="text-slate-500 text-xs">{formatRelativeTime(click.clicked_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* Top Performers — live from /api/admin/campaigns sorted by revenue */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
          </div>
          {campaignsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-surface-2/50 rounded animate-pulse" />
              ))}
            </div>
          ) : topCampaigns.length === 0 ? (
            <p className="text-slate-400 text-sm">No campaigns found.</p>
          ) : (
            <ul className="space-y-2">
              {topCampaigns.map((campaign, index) => (
                <li key={campaign.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 text-xs w-4 flex-shrink-0">{index + 1}.</span>
                    <span className="text-slate-300 truncate max-w-[160px]">{campaign.name}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0">{campaign.payout_type}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-slate-400 text-xs">{Number(campaign.clicks).toLocaleString()} clicks</span>
                    <span className="text-green-400 text-xs font-medium">{formatCurrency(campaign.revenue)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
