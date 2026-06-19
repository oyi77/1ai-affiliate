import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { Sun, Calendar, Clock } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHeatColor(count, max) {
  if (max === 0) return 'bg-slate-800/40';
  const ratio = count / max;
  if (ratio >= 0.8) return 'bg-yellow-500/80';
  if (ratio >= 0.6) return 'bg-green-500/60';
  if (ratio >= 0.3) return 'bg-indigo-500/40';
  if (count > 0) return 'bg-blue-400/20';
  return 'bg-slate-800/30';
}

function formatHour(h) {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

export function DayParting() {
  const [tooltip, setTooltip] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dayparting-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    },
  });

  const heatGrid = stats?.dayparting_heatmap || [];
  const grid = DAYS.map((day, dayIdx) => HOURS.map((hour) => {
    const cell = heatGrid.find((c) => c.day === dayIdx && c.hour === hour);
    return cell?.clicks ?? 0;
  }));

  const maxClicks = Math.max(...grid.flat(), 1);

  const totalByHour = HOURS.map((h) => grid.reduce((sum, row) => sum + row[h], 0));
  const totalByDay = grid.map((row) => row.reduce((s, v) => s + v, 0));

  const bestHourIdx = totalByHour.indexOf(Math.max(...totalByHour));
  const bestDayIdx = totalByDay.indexOf(Math.max(...totalByDay));

  const peakStart = HOURS.reduce(
    (acc, h) => (totalByHour[h] > totalByHour[acc] ? h : acc),
    0
  );

  const handleMouseEnter = (dayIdx, hour, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      day: DAYS[dayIdx],
      hour: formatHour(hour),
      clicks: grid[dayIdx][hour],
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Day-Parting Analysis
        </h1>
        <p className="text-slate-400 mt-2">Click volume distribution across days and hours to optimize ad scheduling</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Best Hour"
          value={isLoading ? '—' : formatHour(bestHourIdx)}
          icon={Clock}
          accent="indigo"
        />
        <StatCard
          label="Best Day"
          value={isLoading ? '—' : DAYS[bestDayIdx]}
          icon={Calendar}
          accent="green"
        />
        <StatCard
          label="Peak Period"
          value={isLoading ? '—' : `${formatHour(peakStart)}–${formatHour((peakStart + 3) % 24)}`}
          icon={Sun}
          accent="yellow"
        />
      </div>

      {/* Heatmap */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-white">Click Volume Heatmap</h2>
          <span className="text-xs text-slate-500">— hover for details</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Hour labels */}
            <div className="flex gap-0 min-w-[600px]">
              <div className="w-10 flex-shrink-0" /> {/* spacer for day labels */}
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-slate-500 font-mono">
                  {h % 3 === 0 ? formatHour(h) : ''}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            <div className="mt-1 space-y-0.5 min-w-[600px]">
              {DAYS.map((day, dayIdx) => (
                <div key={day} className="flex gap-0 items-center">
                  <div className="w-10 flex-shrink-0 text-xs text-slate-400 font-medium pr-2 text-right">
                    {day}
                  </div>
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      onMouseEnter={(e) => handleMouseEnter(dayIdx, hour, e)}
                      onMouseLeave={() => setTooltip(null)}
                      className={`flex-1 aspect-square rounded-sm cursor-pointer transition-transform hover:scale-125 hover:z-10 ${getHeatColor(
                        grid[dayIdx][hour],
                        maxClicks
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
              <span>Low</span>
              <span className="w-3 h-3 rounded-sm bg-blue-400/20" />
              <span className="w-3 h-3 rounded-sm bg-indigo-500/40" />
              <span className="w-3 h-3 rounded-sm bg-green-500/60" />
              <span className="w-3 h-3 rounded-sm bg-yellow-500/80" />
              <span>Peak</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl text-sm"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          <span className="text-white font-medium">{tooltip.day} {tooltip.hour}</span>
          <span className="text-slate-400 ml-2">{tooltip.clicks.toLocaleString()} clicks</span>
        </div>
      )}
    </div>
  );
}
