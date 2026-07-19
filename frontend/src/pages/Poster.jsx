import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MessageCircle,
  Plus
} from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

export function Poster() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_url: '',
    product_name: '',
    image_url: '',
    normal_price: '',
    promo_price: '',
    affiliate_link: '',
    niche: 'general',
  });

  const { data: queueData, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['poster-queue'],
    queryFn: async () => {
      const r = await api.get('/api/poster/queue?limit=50');
      return r.data?.data ?? r.data ?? [];
    },
  });

  const { data: posterStatus } = useSafeQuery({
    queryKey: ['poster-status'],
    queryFn: async () => {
      const r = await api.get('/api/poster/queue');
      const items = r.data?.data ?? r.data ?? [];
      return {
        connected: true,
        queueSize: Array.isArray(items) ? items.filter(i => i.status === 'pending').length : 0,
        postedToday: Array.isArray(items) ? items.filter(i => i.status === 'posted').length : 0,
        failed: Array.isArray(items) ? items.filter(i => i.status === 'failed').length : 0,
      };
    },
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      const r = await api.post('/api/poster/trigger');
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poster-queue'] });
    },
  });

  const addToQueueMutation = useMutation({
    mutationFn: async (data) => {
      const r = await api.post('/api/poster/queue', data);
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poster-queue'] });
      setModalOpen(false);
      setFormData({ product_url: '', product_name: '', image_url: '', normal_price: '', promo_price: '', affiliate_link: '', niche: 'general' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { product_url, product_name, image_url, normal_price, promo_price, affiliate_link, niche } = formData;
    if (!product_url || !product_name || !normal_price || !promo_price) return;
    addToQueueMutation.mutate({
      product_url,
      product_name,
      image_url: image_url || undefined,
      normal_price: parseInt(normal_price),
      promo_price: parseInt(promo_price),
      affiliate_link: affiliate_link || undefined,
      niche: niche || 'general',
    });
  };

  const formatRelativeTime = (date) => {
    const diff = new Date(date) - Date.now();
    const absDiff = Math.abs(diff);
    const seconds = Math.floor(absDiff / 1000);
    
    if (diff < 0) {
      // Past
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    } else {
      // Future
      if (seconds < 60) return `in ${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `in ${minutes}m`;
      const hours = Math.floor(minutes / 60);
      return `in ${hours}h`;
    }
  };

  const columns = [
    {
      header: 'Product',
      accessorKey: 'product_name',
      cell: ({ row }) => (
        <span className="text-sm text-white font-medium">{row.original.product_name}</span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">
            {formatRelativeTime(row.original.created_at)}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;

        if (status === 'pending' || status === 'queued') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5 w-fit">
              <Clock className="w-3 h-3" />
              PENDING
            </span>
          );
        }

        if (status === 'posted' || status === 'sent') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5 w-fit">
              <CheckCircle2 className="w-3 h-3" />
              POSTED
            </span>
          );
        }

        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5 w-fit">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      },
    },
    {
      header: 'Niche',
      accessorKey: 'niche',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400 font-mono">{row.original.niche || 'general'}</span>
      ),
    },
  ];

  if (isError && (!queueData || (Array.isArray(queueData) && !queueData.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
            Telegram Poster
          </h1>
          <p className="text-slate-400">Monitor automated posting queue and channel activity</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-primary hover:bg-indigo-light text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Manual Post
        </button>
        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {triggerMutation.isPending ? 'Sending...' : 'Trigger Post'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Status"
          value={posterStatus?.connected !== false ? 'Connected' : 'Disconnected'}
          accent={posterStatus?.connected !== false ? 'green' : 'red'}
          icon={posterStatus?.connected !== false ? CheckCircle2 : XCircle}
        />
        <StatCard
          label="Queue Size"
          value={String(posterStatus?.queueSize ?? 0)}
          accent="yellow"
          icon={Clock}
        />
        <StatCard
          label="Posted Today"
          value={(posterStatus?.postedToday ?? 0).toLocaleString()}
          accent="green"
          icon={MessageCircle}
        />
        <StatCard
          label="Failed Today"
          value={String(posterStatus?.failed ?? 0)}
          accent={(posterStatus?.failed ?? 0) > 0 ? 'red' : 'green'}
          icon={XCircle}
        />
      </div>

      <GlassCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
            Post Queue
          </h2>
          <p className="text-sm text-slate-400">Scheduled and pending posts across all channels</p>
        </div>
        <DataTable data={queueData} columns={columns} searchable={false} exportable={false} />
      </GlassCard>

      {(posterStatus?.connected !== false) && (
        <GlassCard className="border-green-500/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Telegram Connected</h3>
              <p className="text-sm text-slate-400">
                Bot is connected and processing the queue. Posts will be sent automatically based on their scheduled time.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Manual Post"
        description="Create and schedule a post to Telegram"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Product URL
              </label>
              <input
                type="url"
                required
                value={formData.product_url}
                onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
                placeholder="https://shopee.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Affiliate Link (optional)
              </label>
              <input
                type="url"
                value={formData.affiliate_link}
                onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Normal Price (Rp)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.normal_price}
                onChange={(e) => setFormData({ ...formData, normal_price: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Promo Price (Rp)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.promo_price}
                onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors"
                placeholder="80000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Niche
            </label>
            <select
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-primary transition-colors"
            >
              <option value="general">General</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home & Living</option>
              <option value="beauty">Beauty</option>
              <option value="sports">Sports</option>
            </select>
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
              className="px-4 py-2 bg-indigo-primary hover:bg-indigo-light text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Add to Queue
            </button>
          </div>
        </form>
    </div>
  );
}
