import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({ label, value, change, sparkline = [], accent = 'blue', icon: Icon }) {
  const accentColors = {
    blue: { bg: 'bg-accent-subtle', text: 'text-accent-light' },
    green: { bg: 'bg-green-success/10', text: 'text-green-success' },
    red: { bg: 'bg-red-error/10', text: 'text-red-error' },
    yellow: { bg: 'bg-yellow-warning/10', text: 'text-yellow-warning' },
  };

  const colors = accentColors[accent] || accentColors.blue;
  const trendDirection = change?.direction || 'flat';
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor = trendDirection === 'up' ? 'text-green-success' : trendDirection === 'down' ? 'text-red-error' : 'text-slate-400';

  const renderSparkline = () => {
    const valid = sparkline.filter(v => typeof v === 'number' && isFinite(v));
    if (!valid.length) return null;
    const max = Math.max(...valid);
    const min = Math.min(...valid);
    const range = max - min || 1;
    const points = valid.map((val, i) => {
      const x = (i / (valid.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg className="w-full h-8 opacity-20 mt-1.5" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={points} />
      </svg>
    );
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wide">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
          {label}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor} tabular-nums`}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(change.value)}%
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
        {value}
      </div>

      {change?.vsLabel && (
        <div className="text-xs text-slate-500 mt-0.5">{change.vsLabel}</div>
      )}

      <div className={colors.text}>
        {renderSparkline()}
      </div>
    </div>
  );
}
