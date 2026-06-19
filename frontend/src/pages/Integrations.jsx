import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { 
  Plus, 
  Webhook, 
  XCircle, 
  Activity,
  RefreshCw,
  Zap
} from 'lucide-react';

const EVENT_TYPES = [
  { id: 'click', label: 'Click' },
  { id: 'lead', label: 'Lead' },
  { id: 'sale', label: 'Sale' },
  { id: 'install', label: 'Install' },
];

export function Integrations() {
  const [modalOpen, setModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    postback_url: '',
    secret: '',
    events: ['click', 'lead', 'sale'],
    active: true
  });

  const queryClient = useQueryClient();

  const { data: networks, isLoading } = useQuery({
    queryKey: ['networks'],
    queryFn: async () => {
      const response = await api.get('/api/admin/networks');
      return response.data?.data ?? response.data
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/networks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['networks']);
      setModalOpen(false);
      setFormData({ name: '', postback_url: '', secret: '', events: ['click', 'lead', 'sale'], active: true });
    },
  });

  const testPostback = async (id) => {
    setTestingId(id);
    try {
      await api.post('/api/admin/networks/test', { id });
      queryClient.invalidateQueries(['networks']);
    } catch (error) {
      console.error('Test postback failed', error);
    } finally {
      setTestingId(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const toggleEvent = (eventId) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const summary = networks ? {
    active: networks.filter(n => n.active).length,
    postbacksToday: networks.reduce((sum, n) => sum + (n.postbacks_today || 0), 0),
    successRate: networks.length > 0 
      ? (networks.reduce((sum, n) => sum + (n.success_rate || 0), 0) / networks.length).toFixed(1) 
      : 0,
    failed: networks.reduce((sum, n) => sum + (n.failed_today || 0), 0)
  } : { active: 0, postbacksToday: 0, successRate: 0, failed: 0 };

  const columns = [
    {
      header: 'Network',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center">
            <Webhook className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-medium text-white">{row.original.name}</span>
        </div>
      ),
    },
    {
      header: 'Postback URL',
      accessorKey: 'postback_url',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400 font-mono truncate max-w-xs block">
          {row.original.postback_url}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ row }) => {
        const isActive = row.original.active;
        const hasErrors = row.original.last_error;
        
        if (!isActive) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
              INACTIVE
            </span>
          );
        }
        
        if (hasErrors) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
              ERROR
            </span>
          );
        }
        
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
            ACTIVE
          </span>
        );
      },
    },
    {
      header: 'Last Fired',
      accessorKey: 'last_fired',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400">
          {row.original.last_fired ? new Date(row.original.last_fired).toLocaleString() : 'Never'}
        </span>
      ),
    },
    {
      header: 'Success %',
      accessorKey: 'success_rate',
      cell: ({ row }) => {
        const rate = row.original.success_rate || 0;
        const color = rate >= 90 ? 'text-green-400' : rate >= 70 ? 'text-yellow-400' : 'text-red-400';
        return <span className={`text-sm font-bold ${color}`}>{rate}%</span>;
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => testPostback(row.original.id)}
          disabled={testingId === row.original.id}
          className={`p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors ${
            testingId === row.original.id ? 'animate-spin' : ''
          }`}
          title="Test Postback"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
            API Integrations
          </h1>
          <p className="text-slate-400">Manage postback integrations and webhook endpoints</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-primary hover:bg-indigo-light text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Integrations"
          value={summary.active.toString()}
          accent="indigo"
          icon={Webhook}
        />
        <StatCard
          label="Postbacks Today"
          value={summary.postbacksToday.toLocaleString()}
          accent="green"
          icon={Activity}
        />
        <StatCard
          label="Success Rate"
          value={`${summary.successRate}%`}
          accent="indigo"
          icon={Zap}
        />
        <StatCard
          label="Failed Today"
          value={summary.failed.toString()}
          accent="red"
          icon={XCircle}
        />
      </div>

      <GlassCard>
        <DataTable data={networks || []} columns={columns} />
      </GlassCard>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Integration"
        description="Configure a new postback integration"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Network Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
              placeholder="e.g., MaxBounty, PeerFly"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Postback URL
            </label>
            <input
              type="url"
              required
              value={formData.postback_url}
              onChange={(e) => setFormData({ ...formData, postback_url: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors font-mono text-sm"
              placeholder="https://network.com/postback?click_id={click_id}"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use macros: {'{click_id}'}, {'{conversion_id}'}, {'{payout}'}, {'{status}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Secret Key (Optional)
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors font-mono"
              placeholder="Optional authentication secret"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Events to Track
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map(event => (
                <label
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:border-indigo-primary/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="w-4 h-4 rounded border-white/20 bg-black/30 text-indigo-primary focus:ring-indigo-primary focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-300">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-primary hover:bg-indigo-light text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Integration'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
