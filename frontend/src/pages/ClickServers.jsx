import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Server, MousePointerClick, Calendar } from 'lucide-react';

export function ClickServers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    active: true
  });

  const queryClient = useQueryClient();

  const { data: servers, isLoading } = useSafeQuery({
    queryKey: ['click-servers'],
    queryFn: async () => {
      const response = await api.get('/api/admin/clickservers');
      const raw = response.data?.data ?? response.data;
      return Array.isArray(raw) ? raw : (raw?.domains ?? []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/clickservers', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['click-servers']);
      setModalOpen(false);
      setFormData({ url: '', name: '', active: true });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const totalClicks = servers?.reduce((sum, s) => sum + (s.clicks || 0), 0) || 0;

  const columns = [
    {
      header: 'Server',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-white">{row.original.name || row.original.url}</div>
            <div className="text-xs text-slate-500">{row.original.url}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          row.original.active 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {row.original.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-white">{(row.original.clicks || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Added Date',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {row.original.created_at ? new Date(Number(row.original.created_at) * 1000).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Click Servers
          </h1>
          <p className="text-slate-400 mt-2">Manage click tracking servers and monitor traffic distribution</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Server
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Servers</div>
          <div className="text-3xl font-bold text-white">{servers?.length || 0}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Active Servers</div>
          <div className="text-3xl font-bold text-green-success">
            {servers?.filter(s => s.active).length || 0}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Clicks</div>
          <div className="text-3xl font-bold text-blue-400">
            {totalClicks.toLocaleString()}
          </div>
        </GlassCard>
      </div>

      <DataTable data={servers || []} columns={columns} isLoading={isLoading} />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Click Server"
        description="Configure a new server for click tracking and traffic distribution"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Server URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="https://track1.example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Server Name (Optional)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Primary US Server"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-indigo-primary' : 'bg-slate-700'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Activate Immediately</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Server'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
