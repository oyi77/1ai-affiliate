import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { BarChart3, Layers, MousePointer, GitBranch } from 'lucide-react';

const MODELS = [
  {
    id: 'first_touch',
    name: 'First Touch',
    description: 'Credits 100% of conversion to the first interaction in the customer journey.',
    icon: GitBranch,
    color: 'indigo',
  },
  {
    id: 'last_touch',
    name: 'Last Touch',
    description: 'Credits 100% of conversion to the final interaction before purchase.',
    icon: Layers,
    color: 'green',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Splits credit equally across all touchpoints in the conversion path.',
    icon: BarChart3,
    color: 'yellow',
  },
];

export function Attribution() {
  const { data: stats, isLoading } = useSafeQuery({
    queryKey: ['attribution-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    },
  });

  const activeModels = stats?.active_models ?? 3;
  const conversionsAttributed = stats?.conversions_attributed ?? 0;
  const avgTouchpoints = stats?.avg_touchpoints ?? 0;

  const isModelActive = (modelId) => {
    if (!stats?.attribution_models) return true;
    return stats.attribution_models.some((m) => m.id === modelId && m.active);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Attribution Models
        </h1>
        <p className="text-slate-400 mt-2">Configure and monitor how conversions are attributed across touchpoints</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Active Models"
          value={isLoading ? '—' : activeModels}
          icon={Layers}
          accent="indigo"
        />
        <StatCard
          label="Conversions Attributed"
          value={isLoading ? '—' : conversionsAttributed.toLocaleString()}
          icon={BarChart3}
          accent="green"
        />
        <StatCard
          label="Avg Touchpoints"
          value={isLoading ? '—' : avgTouchpoints.toFixed(1)}
          icon={MousePointer}
          accent="yellow"
        />
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODELS.map((model) => {
          const Icon = model.icon;
          const active = isModelActive(model.id);

          return (
            <GlassCard key={model.id} className="relative">
              {/* Active pill */}
              <span
                className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  active
                    ? 'bg-green-success/20 text-green-success'
                    : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                {active ? 'Active' : 'Inactive'}
              </span>

              <div className={`w-10 h-10 rounded-lg bg-${model.color}-primary/10 flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 text-${model.color}-light`} />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{model.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{model.description}</p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
