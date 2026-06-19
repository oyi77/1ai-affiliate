import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { 
  Play, 
  Pause, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const MOCK_STATUS = {
  connected: true,
  lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  itemsProcessed: 1247,
  errors: 3,
  running: true
};

const MOCK_ACTIVITY = [
  { id: 1, time: new Date(Date.now() - 1000 * 60 * 2), action: 'Video scraped', item: '@username/video123', status: 'success' },
  { id: 2, time: new Date(Date.now() - 1000 * 60 * 5), action: 'Metadata extracted', item: '@creator/post456', status: 'success' },
  { id: 3, time: new Date(Date.now() - 1000 * 60 * 8), action: 'Download failed', item: '@brand/reel789', status: 'error' },
  { id: 4, time: new Date(Date.now() - 1000 * 60 * 12), action: 'Video scraped', item: '@influencer/clip321', status: 'success' },
  { id: 5, time: new Date(Date.now() - 1000 * 60 * 15), action: 'API rate limit', item: '@viral/trending654', status: 'warning' },
  { id: 6, time: new Date(Date.now() - 1000 * 60 * 20), action: 'Video scraped', item: '@marketing/ad987', status: 'success' },
  { id: 7, time: new Date(Date.now() - 1000 * 60 * 25), action: 'Metadata extracted', item: '@shop/product111', status: 'success' },
  { id: 8, time: new Date(Date.now() - 1000 * 60 * 30), action: 'Thumbnail generated', item: '@content/tutorial222', status: 'success' },
];

const NOW = Date.now();

export function Pipeline() {
  const [running, setRunning] = useState(MOCK_STATUS.running);

  const togglePipeline = () => {
    setRunning(!running);
  };


  const formatRelativeTime = (date) => {
    const seconds = Math.floor((NOW - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const columns = [
    {
      header: 'Time',
      accessorKey: 'time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">
            {formatRelativeTime(row.original.time)}
          </span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <span className="text-sm text-white font-medium">{row.original.action}</span>
      ),
    },
    {
      header: 'Item',
      accessorKey: 'item',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400 font-mono">{row.original.item}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        
        if (status === 'success') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5 w-fit">
              <CheckCircle2 className="w-3 h-3" />
              SUCCESS
            </span>
          );
        }
        
        if (status === 'error') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5 w-fit">
              <XCircle className="w-3 h-3" />
              ERROR
            </span>
          );
        }
        
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5 w-fit">
            <Activity className="w-3 h-3" />
            WARNING
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
            TikTok Pipeline
          </h1>
          <p className="text-slate-400">Monitor content scraping and processing pipeline</p>
        </div>
        <button
          onClick={togglePipeline}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            running
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
              : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
          }`}
        >
          {running ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Pipeline
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Pipeline
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Status"
          value={MOCK_STATUS.connected ? 'Connected' : 'Disconnected'}
          accent={MOCK_STATUS.connected ? 'green' : 'red'}
          icon={MOCK_STATUS.connected ? CheckCircle2 : XCircle}
        />
        <StatCard
          label="Last Sync"
          value={formatRelativeTime(MOCK_STATUS.lastSync)}
          accent="indigo"
          icon={Clock}
        />
        <StatCard
          label="Items Processed"
          value={MOCK_STATUS.itemsProcessed.toLocaleString()}
          accent="green"
          icon={TrendingUp}
        />
        <StatCard
          label="Errors"
          value={MOCK_STATUS.errors.toString()}
          accent={MOCK_STATUS.errors > 0 ? 'red' : 'green'}
          icon={XCircle}
        />
      </div>

      <GlassCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
            Activity Log
          </h2>
          <p className="text-sm text-slate-400">Recent pipeline activity and events</p>
        </div>
        <DataTable data={MOCK_ACTIVITY} columns={columns} searchable={false} exportable={false} />
      </GlassCard>

      {running && (
        <GlassCard className="border-indigo-primary/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Pipeline Running</h3>
              <p className="text-sm text-slate-400">
                The TikTok scraping pipeline is actively processing content. New items are being discovered and extracted in real-time.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
