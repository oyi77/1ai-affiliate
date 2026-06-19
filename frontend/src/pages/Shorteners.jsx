import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import { Link2, CheckCircle2, XCircle, Plus, Trash2, Key, RefreshCw } from 'lucide-react';

const PREDEFINED_SERVICES = [
  { id: 'bitly', name: 'Bitly', description: 'World\'s leading link management platform' },
  { id: 'tinyurl', name: 'TinyURL', description: 'The original link shortener' },
  { id: 'rebrandly', name: 'Rebrandly', description: 'The leader in link branding' },
  { id: 'cuttly', name: 'Cutt.ly', description: 'URL Shortener & Link Management' },
  { id: 'shortio', name: 'Short.io', description: 'Short links for brands' },
];

export function Shorteners() {
  const [modalOpen, setModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [formData, setFormData] = useState({
    service_id: '',
    name: '',
    api_key: '',
    custom_endpoint: ''
  });

  const queryClient = useQueryClient();

  const { data: integrations } = useQuery({
    queryKey: ['shorteners'],
    queryFn: async () => {
      const response = await api.get('/api/admin/shorteners');
      return response.data?.data ?? response.data
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/shorteners', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shorteners']);
      setModalOpen(false);
      setFormData({ service_id: '', name: '', api_key: '', custom_endpoint: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/shorteners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['shorteners']);
    },
  });

  const testConnection = async (id) => {
    setTestingId(id);
    try {
      await api.post(`/api/admin/shorteners/test`, { id });
      queryClient.invalidateQueries(['shorteners']);
    } catch (error) {
      console.error('Test connection failed', error);
    } finally {
      setTestingId(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusDisplay = (status) => {
    if (status === 'connected') return <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED</div>;
    if (status === 'error') return <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> ERROR</div>;
    return <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">DISCONNECTED</div>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Shortener Integrations
          </h1>
          <p className="text-slate-400 mt-2">Connect third-party URL shortening services</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PREDEFINED_SERVICES.map((service) => {
          const integration = integrations?.find(i => i.service_id === service.id);
          
          return (
            <GlassCard key={service.id} className="relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-indigo-400" />
                </div>
                {integration ? getStatusDisplay(integration.status) : (
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Not Configured</span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                <p className="text-sm text-slate-400 mb-6">{service.description}</p>
                
                {integration ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-black/20 border border-white/5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300 font-mono">••••••••••••••••</span>
                      </div>
                      <button 
                        onClick={() => testConnection(integration.id)}
                        disabled={testingId === integration.id}
                        className={`p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-all ${testingId === integration.id ? 'animate-spin' : ''}`}
                        title="Test Connection"
                      >
                        <RefreshCw className={`w-4 h-4 ${testingId === integration.id ? 'text-indigo-400' : ''}`} />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteMutation.mutate(integration.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setFormData({ ...formData, service_id: service.id, name: service.name });
                      setModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-white/5 hover:bg-indigo-primary/10 border border-white/10 hover:border-indigo-primary/30 text-white text-sm font-bold rounded-lg transition-all"
                  >
                    Connect Service
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Connect Shortener"
        description="Configure your API credentials to enable URL shortening"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Service</label>
            <select
              value={formData.service_id}
              onChange={(e) => {
                const s = PREDEFINED_SERVICES.find(ps => ps.id === e.target.value);
                setFormData({ ...formData, service_id: e.target.value, name: s?.name || '' });
              }}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none"
              required
            >
              <option value="" disabled className="bg-surface-2">Select a service</option>
              {PREDEFINED_SERVICES.map(s => (
                <option key={s.id} value={s.id} className="bg-surface-2">{s.name}</option>
              ))}
              <option value="custom" className="bg-surface-2">Custom Integration</option>
            </select>
          </div>

          {formData.service_id === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Service Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                placeholder="My Custom Shortener"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">API Key / Token</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-indigo-primary"
                placeholder="Paste your API key here"
                required
              />
            </div>
          </div>

          {formData.service_id === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">API Endpoint (Optional)</label>
              <input
                type="url"
                value={formData.custom_endpoint}
                onChange={(e) => setFormData({ ...formData, custom_endpoint: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                placeholder="https://api.myshortener.com/v1"
              />
            </div>
          )}

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
              {createMutation.isPending ? 'Connecting...' : 'Connect Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
