import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  Crown, 
  Star, 
  Trophy, 
  Zap, 
  Check
} from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    icon: Star,
    color: 'slate',
    minRevenue: '$0',
    features: ['Basic tracking', 'Standard support', '5 campaigns', 'Email notifications'],
  },
  {
    name: 'Pro',
    icon: Trophy,
    color: 'indigo',
    minRevenue: '$1,000/mo',
    features: ['Advanced analytics', 'Priority support', 'Unlimited campaigns', 'AI tools access', 'Custom domains', 'API access'],
  },
  {
    name: 'Premium',
    icon: Crown,
    color: 'yellow',
    minRevenue: '$10,000/mo',
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'White-label options', 'Higher API limits', 'Early access features'],
  },
];

export function VIPPerks() {
  const { data: profile } = useQuery({
    queryKey: ['vip-profile'],
    queryFn: async () => {
      const response = await api.get('/api/admin/vip');
      return response.data?.data ?? response.data
    },
  });

  const currentTier = profile?.tier || 'Starter';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-warning via-white to-yellow-warning bg-clip-text text-transparent">
          VIP Program
        </h1>
        <p className="text-slate-400 mt-2">Unlock exclusive benefits as you grow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrent = currentTier === tier.name;
          const colorMap = {
            slate: 'from-slate-600 to-slate-500',
            indigo: 'from-indigo-primary to-indigo-light',
            yellow: 'from-yellow-warning to-yellow-500',
          };
          const borderColorMap = {
            slate: 'border-slate-500',
            indigo: 'border-indigo-primary',
            yellow: 'border-yellow-warning',
          };

          return (
            <GlassCard
              key={tier.name}
              className={`relative overflow-hidden ${isCurrent ? `border-2 ${borderColorMap[tier.color]} shadow-glow` : ''}`}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-primary text-white text-xs font-bold rounded-full">
                  Current
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorMap[tier.color]} flex items-center justify-center mb-6 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-slate-400 text-sm mb-6">Min. revenue: {tier.minRevenue}</p>

              <ul className="space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-success shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <button className="w-full mt-8 py-3 bg-surface-3 text-slate-300 rounded-lg font-bold hover:bg-surface-hover transition-all border border-white/5">
                  {tiers.indexOf(tier) > tiers.findIndex(t => t.name === currentTier) ? 'Upgrade' : 'Downgrade'}
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>

      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-success/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-green-success" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Current Benefits</h3>
            <p className="text-slate-400 text-sm">Your tier: {currentTier}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Calls/day', value: '10,000' },
            { label: 'Active Campaigns', value: 'Unlimited' },
            { label: 'Data Retention', value: '90 days' },
            { label: 'Support Response', value: '< 24h' },
          ].map(benefit => (
            <div key={benefit.label} className="p-4 bg-black/20 border border-white/5 rounded-lg text-center">
              <div className="text-xl font-bold text-white">{benefit.value}</div>
              <div className="text-xs text-slate-500 mt-1">{benefit.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
