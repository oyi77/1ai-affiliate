import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
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
import { ErrorState } from '../components/ErrorState';

export function Pipeline() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(true);
  const [urlInput, setUrlInput] = useState('');

  const { data: jobsData, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['pipeline-jobs'],
    queryFn: async () => {
      const r = await api.get('/api/pipeline/jobs?limit=50');
      return r.data?.data ?? r.data ?? [];
    },
  });

  const { data: accounts } = useSafeQuery({
    queryKey: ['pipeline-accounts'],
    queryFn: async () => {
      const r = await api.get('/api/pipeline/accounts');
      return r.data?.data ?? r.data ?? {};
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      // Toggle is local state only — no backend endpoint for start/stop yet
      setRunning((prev) => !prev);
      return { ok: true };
    },
  });

  const runNowMutation = useMutation({
    mutationFn: async (tiktokUrl) => {
      const r = await api.post('/api/pipeline/run', { url: tiktokUrl });
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-jobs'] });
    },
  });

  const jobList = Array.isArray(jobsData) ? jobsData : [];
  const accountsAvailable = accounts?.fbPages?.length > 0 || accounts?.igAccounts?.length > 0;
  const successCount = jobList.filter((j) => j.status === 'success').length;
  const errorCount = jobList.filter((j) => j.status === 'error' || j.status === 'failed').length;
  const lastSyncTime = jobList.length > 0 ? jobList[0].created_at || jobList[0].time : null;

  const formatRelativeTime = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
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

  if (isError && (!jobsData || (Array.isArray(jobsData) && !jobsData.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
            TikTok Pipeline
          </h1>
          <p className="text-slate-400">Monitor content scraping and processing pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const url = window.prompt('Enter TikTok video URL to process:');
              if (url) runNowMutation.mutate(url);
            }}
            disabled={runNowMutation.isPending}
            className="px-4 py-2 bg-indigo-primary hover:bg-indigo-light text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {runNowMutation.isPending ? 'Running...' : 'Run Now'}
          </button>
          <button
            onClick={() => toggleMutation.mutate()}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Status"
          value={accountsAvailable ? 'Connected' : 'Disconnected'}
          accent={accountsAvailable ? 'green' : 'red'}
          icon={accountsAvailable ? CheckCircle2 : XCircle}
        />
        <StatCard
          label="Last Sync"
          value={lastSyncTime ? formatRelativeTime(lastSyncTime) : '—'}
          accent="indigo"
          icon={Clock}
        />
        <StatCard
          label="Items Processed"
          value={successCount.toLocaleString()}
          accent="green"
          icon={TrendingUp}
        />
        <StatCard
          label="Errors"
          value={String(errorCount)}
          accent={errorCount > 0 ? 'red' : 'green'}
          icon={XCircle}
        />

      <GlassCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
            Activity Log
          </h2>
          <p className="text-sm text-slate-400">Recent pipeline activity and events</p>
        </div>
        <DataTable data={jobsData} columns={columns} searchable={false} exportable={false} />
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
