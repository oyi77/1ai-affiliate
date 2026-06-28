import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { formatIDR } from '../lib/currency';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { Rocket, Loader2, Eye, MousePointer, ShoppingCart } from 'lucide-react';

const STATUS_STYLES = {
  pending: 'bg-yellow-warning/10 text-yellow-warning border border-yellow-warning/20',
  running: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
  completed: 'bg-green-success/10 text-green-success border border-green-success/20',
  failed: 'bg-red-error/10 text-red-error border border-red-error/20',
  cancelled: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

export function BoostOrders() {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [comingSoon, setComingSoon] = useState(false);
  const [formData, setFormData] = useState({
    offer_id: '',
    fanpage_count: 500,
    post_content: '',
    target_url: '',
  });
  const queryClient = useQueryClient();

  // ── Fetch boost orders (admin finance fallback) ───────────────────
  const { data: orders, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['boost-orders'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/boost/orders');
        return res.data?.data ?? res.data ?? [];
      } catch {
        // Fallback to admin finance endpoint
        const res = await api.get('/api/admin/finance/boost-orders');
        return res.data?.data ?? res.data ?? [];
      }
    },
  });

  // ── Fetch offers for the dropdown ─────────────────────────────────
  const { data: offers } = useSafeQuery({
    queryKey: ['offers-list'],
    queryFn: async () => {
      const res = await api.get('/api/admin/offers?limit=100');
      return res.data?.data ?? res.data ?? [];
    },
  });

  // ── Fetch pricing for cost preview ────────────────────────────────
  const { data: pricing } = useSafeQuery({
    queryKey: ['wallet-pricing'],
    queryFn: async () => {
      const res = await api.get('/api/wallet/pricing');
      return res.data?.data ?? {};
    },
    fallback: {},
  });

  // ── Fetch wallet balance for confirmation step ────────────────────
  const { data: wallet } = useSafeQuery({
    queryKey: ['wallet-summary'],
    queryFn: async () => {
      const res = await api.get('/api/wallet');
      return res.data?.data ?? res.data ?? {};
    },
    fallback: {},
  });

  // ── Create boost order mutation ───────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/api/boost/orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boost-orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      closeModal();
    },
    onError: (err) => {
      if (err.response?.status === 404) {
        setComingSoon(true);
      } else {
        setFormError(err.response?.data?.error || 'Failed to create boost order');
      }
    },
  });

  function openModal() {
    setStep(1);
    setFormData({ offer_id: '', fanpage_count: 500, post_content: '', target_url: '' });
    setFormError('');
    setComingSoon(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setStep(1);
    setFormError('');
    setComingSoon(false);
  }

  function nextStep() {
    if (step === 1 && !formData.offer_id) {
      setFormError('Please select an offer');
      return;
    }
    if (step === 2) {
      if (formData.fanpage_count < 100 || formData.fanpage_count > 3000) {
        setFormError('Fanpage count must be between 100 and 3000');
        return;
      }
      if (!formData.post_content.trim()) {
        setFormError('Post content is required');
        return;
      }
      if (!formData.target_url.trim()) {
        setFormError('Target URL is required');
        return;
      }
    }
    setFormError('');
    setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setFormError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  // Cost per fanpage from pricing (feature key: boost_per_fp)
  const costPerFp = Number(pricing?.boost_per_fp?.price) || 1000;
  const totalCost = formData.fanpage_count * costPerFp;
  const balance = Number(wallet?.balance ?? wallet?.balance_amount ?? 0);
  const hasInsufficientFunds = balance < totalCost;

  function handleSubmit() {
    if (hasInsufficientFunds) {
      setFormError('Insufficient wallet balance. Please top up first.');
      return;
    }
    createMutation.mutate({
      offer_id: Number(formData.offer_id),
      fanpage_count: Number(formData.fanpage_count),
      post_content: formData.post_content.trim(),
      target_url: formData.target_url.trim(),
    });
  }

  const orderList = Array.isArray(orders) ? orders : [];
  const totalOrders = orderList.length;
  const activeCount = orderList.filter((o) => o.status === 'running' || o.status === 'pending').length;
  const completedCount = orderList.filter((o) => o.status === 'completed').length;
  const totalSpent = orderList.reduce((sum, o) => sum + (Number(o.cost) || 0), 0);

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ getValue }) => <span className="font-mono text-slate-400 text-sm">#{getValue()}</span>,
    },
    {
      header: 'Offer',
      accessorKey: 'offer_name',
      cell: ({ row }) => {
        const name = row.original.offer_name || `Offer #${row.original.offer_id || '-'}`;
        return <span className="text-white font-medium">{name}</span>;
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = String(getValue() || 'pending').toLowerCase();
        const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Fanpages',
      accessorKey: 'fanpage_count',
      cell: ({ getValue }) => (
        <span className="font-mono text-slate-300">{(getValue() || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Cost',
      accessorKey: 'cost',
      cell: ({ getValue }) => (
        <span className="font-semibold text-white">{formatIDR(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Impressions',
      accessorKey: 'impressions',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono">{(getValue() || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <MousePointer className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono">{(getValue() || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Conversions',
      accessorKey: 'conversions',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-indigo-light">
          <ShoppingCart className="w-3.5 h-3.5 text-indigo-primary" />
          <span className="font-mono">{(getValue() || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      cell: ({ getValue }) => {
        const v = getValue();
        const d = v ? new Date(typeof v === 'number' && v < 9999999999 ? v * 1000 : v) : null;
        return (
          <span className="text-slate-400 text-sm">
            {d ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Boost Orders
          </h1>
          <p className="text-slate-400 mt-2">Manage fanpage boost campaigns for your offers</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
        >
          <Rocket className="w-5 h-5" />
          New Boost Order
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-white">{totalOrders}</h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <Rocket className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Active</p>
              <h3 className="text-2xl font-bold text-blue-400">{activeCount}</h3>
            </div>
            <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-green-success">{completedCount}</h3>
            </div>
            <div className="p-2 bg-green-success/10 rounded-lg text-green-success">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Spent</p>
              <h3 className="text-2xl font-bold text-white">{formatIDR(totalSpent)}</h3>
            </div>
            <div className="p-2 bg-yellow-warning/10 rounded-lg text-yellow-warning">
              <MousePointer className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Orders table ───────────────────────────────────────────── */}
      <GlassCard>
        <DataTable
          data={orderList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No boost orders yet. Create your first one!"
        />
      </GlassCard>

      {/* ── New Boost Order Modal ──────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onOpenChange={(v) => { if (!v) closeModal(); }}
        title="New Boost Order"
        description={`Step ${step} of 4`}
        size="lg"
      >
        {comingSoon ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-warning/10 mb-4">
              <Rocket className="w-8 h-8 text-yellow-warning" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-slate-400 mb-6">
              The boost orders API is not yet available. Please check back later.
            </p>
            <button
              onClick={closeModal}
              className="px-6 py-2.5 bg-surface-3 text-slate-300 rounded-lg font-bold hover:bg-surface-hover transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      s === step
                        ? 'bg-indigo-primary text-white'
                        : s < step
                          ? 'bg-green-success/20 text-green-success'
                          : 'bg-surface-3 text-slate-500'
                    }`}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-0.5 ${s < step ? 'bg-green-success/30' : 'bg-surface-3'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Select Offer */}
            {step === 1 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase">Select Offer *</label>
                <select
                  value={formData.offer_id}
                  onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none"
                >
                  <option value="">— Choose an offer —</option>
                  {(Array.isArray(offers) ? offers : []).map((o) => (
                    <option key={o.id || o.offer_id} value={o.id || o.offer_id}>
                      {o.name || o.offer_name || `Offer #${o.id || o.offer_id}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Select the offer you want to promote with fanpage boosts.</p>
              </div>
            )}

            {/* Step 2: Configure */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                    Fanpage Count: <span className="text-indigo-light">{formData.fanpage_count.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="50"
                    value={formData.fanpage_count}
                    onChange={(e) => setFormData({ ...formData, fanpage_count: Number(e.target.value) })}
                    className="w-full accent-indigo-primary"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>100</span>
                    <span>3,000</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Post Content *</label>
                  <textarea
                    value={formData.post_content}
                    onChange={(e) => setFormData({ ...formData, post_content: e.target.value })}
                    rows={4}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary resize-none"
                    placeholder="Write the content that fanpages will post..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Target URL *</label>
                  <input
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
                    placeholder="https://example.com/landing-page"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Cost Preview */}
            {step === 3 && (
              <div className="space-y-4">
                <GlassCard>
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Cost Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Cost per fanpage</span>
                      <span className="text-white font-mono">{formatIDR(costPerFp)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fanpage count</span>
                      <span className="text-white font-mono">× {formData.fanpage_count.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total Cost</span>
                      <span className="text-indigo-light">{formatIDR(totalCost)}</span>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard>
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Offer</span>
                      <span className="text-white">
                        {(Array.isArray(offers) ? offers : []).find(
                          (o) => String(o.id || o.offer_id) === String(formData.offer_id)
                        )?.name ||
                          (Array.isArray(offers) ? offers : []).find(
                            (o) => String(o.id || o.offer_id) === String(formData.offer_id)
                          )?.offer_name ||
                          `#${formData.offer_id}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Content</span>
                      <span className="text-slate-300 text-right max-w-[200px] truncate">{formData.post_content}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target URL</span>
                      <span className="text-slate-300 text-right max-w-[200px] truncate">{formData.target_url}</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-4">
                <GlassCard>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-primary/10">
                      <Rocket className="w-7 h-7 text-indigo-light" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Confirm Boost Order</h4>
                    <div className="text-3xl font-bold text-indigo-light">{formatIDR(totalCost)}</div>
                    <div className="text-sm text-slate-400">
                      {formData.fanpage_count.toLocaleString()} fanpages will promote your offer
                    </div>
                  </div>
                </GlassCard>
                <div className={`p-3 rounded-lg border text-sm ${
                  hasInsufficientFunds
                    ? 'bg-red-error/10 border-red-error/20 text-red-error'
                    : 'bg-green-success/10 border-green-success/20 text-green-success'
                }`}>
                  {hasInsufficientFunds ? (
                    <span>⚠ Insufficient balance. Current: {formatIDR(balance)} — need {formatIDR(totalCost - balance)} more.</span>
                  ) : (
                    <span>✓ Wallet balance: {formatIDR(balance)} — sufficient for this order.</span>
                  )}
                </div>
              </div>
            )}

            {/* Error display */}
            {formError && (
              <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">
                {formError}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={step > 1 ? prevStep : closeModal}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                {step > 1 ? 'Back' : 'Cancel'}
              </button>
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || hasInsufficientFunds}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light disabled:opacity-50 transition-all"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  Place Order
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
