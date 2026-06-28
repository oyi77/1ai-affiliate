import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { formatIDR } from '../lib/currency';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { ErrorState } from '../components/ErrorState';
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Settings,
  Loader2,
  Search,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';

export function AdminFinance() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Users tab state
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 50;

  // Credit/Debit modal state
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [debitModalOpen, setDebitModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Pricing inline edit state
  const [editingKey, setEditingKey] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Exchange rate form state
  const [exchangeRateForm, setExchangeRateForm] = useState({
    min_topup_usd: '',
    rate: '',
    source: 'manual',
  });

  // ── Data fetching ──────────────────────────────────────────────────

  const { data: overview, isLoading: overviewLoading, isError: overviewError, error: overviewErr, refetch: refetchOverview } = useSafeQuery({
    queryKey: ['admin-finance-overview'],
    queryFn: async () => (await api.get('/api/admin/finance/overview')).data,
  }, {});

  const usersQueryKey = ['admin-finance-users', { page: userPage, search: userSearch, role: userRole }];
  const { data: usersData, isLoading: usersLoading, isError: usersError, error: usersErr, refetch: refetchUsers } = useSafeQuery({
    queryKey: usersQueryKey,
    queryFn: async () => (await api.get(`/api/admin/finance/users?page=${userPage}&limit=${limit}&search=${encodeURIComponent(userSearch)}&role=${encodeURIComponent(userRole)}`)).data,
  }, { users: [], total: 0 });

  const { data: pricingData, isLoading: pricingLoading, isError: pricingError, error: pricingErr, refetch: refetchPricing } = useSafeQuery({
    queryKey: ['admin-finance-pricing'],
    queryFn: async () => (await api.get('/api/admin/finance/pricing')).data,
  }, []);

  const { data: exchangeRateData, isLoading: exchangeLoading, isError: exchangeError, error: exchangeErr, refetch: refetchExchange } = useSafeQuery({
    queryKey: ['admin-finance-exchange-rate'],
    queryFn: async () => (await api.get('/api/admin/finance/exchange-rate')).data,
  }, {});

  const { data: boostOrdersData, isLoading: boostLoading, isError: boostError, error: boostErr, refetch: refetchBoost } = useSafeQuery({
    queryKey: ['admin-finance-boost-orders'],
    queryFn: async () => (await api.get('/api/admin/finance/boost-orders')).data,
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────

  const creditMutation = useMutation({
    mutationFn: async ({ userId, amt, nt }) => (await api.post('/api/admin/finance/credit', { user_id: userId, amount: amt, note: nt })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finance-overview'] });
      closeModals();
    },
  });

  const debitMutation = useMutation({
    mutationFn: async ({ userId, amt, nt }) => (await api.post('/api/admin/finance/debit', { user_id: userId, amount: amt, note: nt })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finance-overview'] });
      closeModals();
    },
  });

  const pricingMutation = useMutation({
    mutationFn: async ({ featureKey, price }) => (await api.put('/api/admin/finance/pricing', { feature_key: featureKey, price })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-pricing'] });
      setEditingKey(null);
      setEditPrice('');
    },
  });

  const exchangeRateMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/api/admin/finance/exchange-rate', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-finance-exchange-rate'] }),
  });

  // ── Handlers ───────────────────────────────────────────────────────

  const closeModals = () => {
    setCreditModalOpen(false);
    setDebitModalOpen(false);
    setSelectedUser(null);
    setAmount('');
    setNote('');
  };

  const openCreditModal = (user) => { setSelectedUser(user); setCreditModalOpen(true); };
  const openDebitModal  = (user) => { setSelectedUser(user); setDebitModalOpen(true); };

  const handleCreditSubmit = (e) => {
    e.preventDefault();
    creditMutation.mutate({ userId: selectedUser.user_id, amt: Number(amount), nt: note });
  };

  const handleDebitSubmit = (e) => {
    e.preventDefault();
    debitMutation.mutate({ userId: selectedUser.user_id, amt: Number(amount), nt: note });
  };

  const handlePricingEdit = (featureKey, currentPrice) => {
    setEditingKey(featureKey);
    setEditPrice(String(currentPrice));
  };

  const handlePricingSave = () => {
    pricingMutation.mutate({ featureKey: editingKey, price: Number(editPrice) });
  };

  const handleExchangeRateSubmit = (e) => {
    e.preventDefault();
    exchangeRateMutation.mutate({
      rate: Number(exchangeRateForm.rate),
      source: exchangeRateForm.source,
      min_topup_usd: Number(exchangeRateForm.min_topup_usd),
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setUserPage(1);
    setUserSearch(searchInput);
  };

  const handleRoleFilter = (e) => {
    setUserRole(e.target.value);
    setUserPage(1);
  };

  const handleFetchLiveRate = () => { /* TODO: integrate live rate API */ };

  // ── Derived values ─────────────────────────────────────────────────

  const users = Array.isArray(usersData) ? usersData : (usersData?.users ?? []);
  const totalUsers = Array.isArray(usersData) ? usersData.length : (usersData?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

  const pricingItems = Array.isArray(pricingData) ? pricingData : (pricingData?.pricing ?? []);

  const boostOrders = Array.isArray(boostOrdersData) ? boostOrdersData : (boostOrdersData?.orders ?? []);

  const computedMinTopupIDR = exchangeRateForm.min_topup_usd && exchangeRateForm.rate
    ? Number(exchangeRateForm.min_topup_usd) * Number(exchangeRateForm.rate)
    : 0;

  // ── Column definitions: Users ──────────────────────────────────────

  const usersColumns = [
    {
      header: 'Email',
      accessorKey: 'user_email',
    },
    {
      header: 'Name',
      accessorKey: 'user_name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-white">{row.original.user_name || '-'}</div>
          <div className="text-xs text-slate-500">{row.original.user_email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'user_role',
      cell: ({ getValue }) => {
        const role = getValue() || 'affiliate';
        const colors = {
          admin: 'bg-purple/10 text-purple border-purple/20',
          advertiser: 'bg-blue/10 text-blue border-blue/20',
          affiliate: 'bg-green-success/10 text-green-success border-green-success/20',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[role] || colors.affiliate}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      },
    },
    {
      header: 'Deposits',
      accessorKey: 'deposits',
      cell: ({ getValue }) => (
        <span className="text-green-success font-mono">{formatIDR(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Withdrawals',
      accessorKey: 'withdrawals',
      cell: ({ getValue }) => (
        <span className="text-red-400 font-mono">{formatIDR(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Spending',
      accessorKey: 'spending',
      cell: ({ getValue }) => (
        <span className="text-yellow-warning font-mono">{formatIDR(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Balance',
      accessorKey: 'balance',
      cell: ({ getValue }) => (
        <span className="text-white font-mono font-bold">{formatIDR(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreditModal(row.original)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-success border border-green-success/30 rounded-lg hover:bg-green-success/10 transition-all"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Credit
          </button>
          <button
            onClick={() => openDebitModal(row.original)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-all"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Debit
          </button>
        </div>
      ),
    },
  ];

  // ── Column definitions: Pricing ────────────────────────────────────

  const pricingColumns = [
    { header: 'Feature Key', accessorKey: 'feature_key' },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => {
        const k = row.original.feature_key;
        if (editingKey === k) {
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-32 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
              />
              <button
                onClick={handlePricingSave}
                disabled={pricingMutation.isPending}
                className="px-3 py-1.5 text-xs font-bold text-green-success border border-green-success/30 rounded-lg hover:bg-green-success/10 transition-all disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => { setEditingKey(null); setEditPrice(''); }}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          );
        }
        return (
          <span className="text-white font-mono">{formatIDR(row.original.price || 0)}</span>
        );
      },
    },
    { header: 'Unit', accessorKey: 'unit' },
    { header: 'Description', accessorKey: 'description' },
    {
      header: 'Last Updated',
      accessorKey: 'updated_at',
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-slate-400 text-sm">{v ? new Date(v).toLocaleString() : '-'}</span>;
      },
    },
    {
      header: 'Actions',
      id: 'pricing-actions',
      cell: ({ row }) => {
        if (editingKey === row.original.feature_key) return null;
        return (
          <button
            onClick={() => handlePricingEdit(row.original.feature_key, row.original.price)}
            className="px-3 py-1.5 text-xs font-bold text-indigo-light border border-indigo-light/30 rounded-lg hover:bg-indigo-light/10 transition-all"
          >
            Edit
          </button>
        );
      },
    },
  ];

  // ── Column definitions: Boost Orders ───────────────────────────────

  const boostOrdersColumns = [
    { header: 'Order ID', accessorKey: 'order_id' },
    {
      header: 'User Email',
      accessorKey: 'user_email',
      cell: ({ getValue }) => (
        <span className="text-slate-300 text-sm">{getValue() || '-'}</span>
      ),
    },
    { header: 'Offer ID', accessorKey: 'offer_id' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const s = getValue() || 'unknown';
        const colors = {
          active: 'bg-green-success/10 text-green-success border-green-success/20',
          completed: 'bg-blue/10 text-blue border-blue/20',
          pending: 'bg-yellow-warning/10 text-yellow-warning border-yellow-warning/20',
          cancelled: 'bg-red-error/10 text-red-error border-red-error/20',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[s] || 'bg-slate-500/10 text-slate-400 border-white/10'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        );
      },
    },
    {
      header: 'Fanpages',
      accessorKey: 'fanpages',
      cell: ({ getValue }) => (
        <span className="text-slate-300">{getValue() ?? '-'}</span>
      ),
    },
    {
      header: 'Total Cost',
      accessorKey: 'total_cost',
      cell: ({ getValue }) => (
        <span className="text-white font-mono">{formatIDR(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Impressions',
      accessorKey: 'impressions',
      cell: ({ getValue }) => (
        <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ getValue }) => (
        <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Conversions',
      accessorKey: 'conversions',
      cell: ({ getValue }) => (
        <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-slate-400 text-sm">{v ? new Date(v).toLocaleDateString() : '-'}</span>;
      },
    },
  ];

  // ── Tab configuration ──────────────────────────────────────────────

  const tabs = [
    { key: 'overview', label: 'Overview', icon: DollarSign },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'pricing', label: 'Pricing', icon: CreditCard },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'boost-orders', label: 'Boost Orders', icon: TrendingUp },
  ];

  const isMutating = creditMutation.isPending || debitMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Finance Management
        </h1>
        <p className="text-slate-400 mt-2">Monitor deposits, withdrawals, pricing, and exchange rates</p>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold capitalize transition-all ${
              activeTab === tab.key
                ? 'bg-surface-2 text-white border-b-2 border-indigo-primary'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {overviewError && <ErrorState error={overviewErr} onRetry={refetchOverview} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Deposits</div>
                <ArrowUpCircle className="w-4 h-4 text-green-success" />
              </div>
              <div className="text-2xl font-bold text-white">{overviewLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(overview.total_deposits || 0)}</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Spending</div>
                <DollarSign className="w-4 h-4 text-yellow-warning" />
              </div>
              <div className="text-2xl font-bold text-white">{overviewLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(overview.total_spending || 0)}</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Withdrawals</div>
                <ArrowDownCircle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{overviewLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(overview.total_withdrawals || 0)}</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Net Revenue</div>
                <TrendingUp className="w-4 h-4 text-indigo-light" />
              </div>
              <div className="text-2xl font-bold text-green-success">{overviewLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(overview.net_revenue || 0)}</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Earnings</div>
                <DollarSign className="w-4 h-4 text-green-success" />
              </div>
              <div className="text-2xl font-bold text-white">{overviewLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(overview.total_earnings || 0)}</div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Pending Earnings</div>
                <TrendingDown className="w-4 h-4 text-yellow-warning" />
              </div>
              <div className="text-2xl font-bold text-white">{overviewLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(overview.pending_earnings || 0)}</div>
            </GlassCard>
          </div>
        </>
      )}

      {/* ── Users Tab ───────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <>
          {usersError && <ErrorState error={usersErr} onRetry={refetchUsers} />}
          <GlassCard>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-surface-3 text-slate-300 rounded-lg text-sm font-bold hover:bg-surface-2 transition-all"
                >
                  Search
                </button>
              </form>
              <select
                value={userRole}
                onChange={handleRoleFilter}
                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="affiliate">Affiliate</option>
                <option value="advertiser">Advertiser</option>
              </select>
            </div>
            <DataTable data={users} columns={usersColumns} isLoading={usersLoading} emptyMessage="No users found" />
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-slate-500">
                  Page {userPage} of {totalPages} — {totalUsers} users
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1.5 text-sm font-bold bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-2 transition-all disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setUserPage((p) => Math.min(totalPages, p + 1))}
                    disabled={userPage === totalPages}
                    className="px-3 py-1.5 text-sm font-bold bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-2 transition-all disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </>
      )}

      {/* ── Pricing Tab ─────────────────────────────────────────────── */}
      {activeTab === 'pricing' && (
        <>
          {pricingError && <ErrorState error={pricingErr} onRetry={refetchPricing} />}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Feature Pricing</h3>
            <DataTable data={pricingItems} columns={pricingColumns} isLoading={pricingLoading} emptyMessage="No pricing items configured" searchable={false} />
          </GlassCard>
        </>
      )}

      {/* ── Settings Tab ────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <>
          {exchangeError && <ErrorState error={exchangeErr} onRetry={refetchExchange} />}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-6">Exchange Rate Settings</h3>
            {exchangeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-primary" />
              </div>
            ) : (
              <form onSubmit={handleExchangeRateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Minimum Topup (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exchangeRateForm.min_topup_usd}
                      onChange={(e) => setExchangeRateForm({ ...exchangeRateForm, min_topup_usd: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder={exchangeRate.min_topup_usd || '0.00'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Exchange Rate (IDR/USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exchangeRateForm.rate}
                      onChange={(e) => setExchangeRateForm({ ...exchangeRateForm, rate: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder={exchangeRate.rate || '0'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Rate Source</label>
                    <select
                      value={exchangeRateForm.source}
                      onChange={(e) => setExchangeRateForm({ ...exchangeRateForm, source: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                    >
                      <option value="manual">Manual</option>
                      <option value="api">API</option>
                    </select>
                  </div>
                </div>
                {exchangeRateForm.min_topup_usd && exchangeRateForm.rate && (
                  <GlassCard>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Computed Minimum Topup (IDR)</span>
                      <span className="text-lg font-bold text-white">{formatIDR(computedMinTopupIDR)}</span>
                    </div>
                  </GlassCard>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleFetchLiveRate}
                    className="px-4 py-2.5 bg-surface-3 text-slate-300 rounded-lg text-sm font-bold hover:bg-surface-2 transition-all"
                  >
                    Fetch Live Rate
                  </button>
                  <button
                    type="submit"
                    disabled={exchangeRateMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {exchangeRateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save
                  </button>
                </div>
              </form>
            )}
          </GlassCard>
        </>
      )}

      {/* ── Boost Orders Tab ────────────────────────────────────────── */}
      {activeTab === 'boost-orders' && (
        <>
          {boostError && <ErrorState error={boostErr} onRetry={refetchBoost} />}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Boost Orders</h3>
            <DataTable data={boostOrders} columns={boostOrdersColumns} isLoading={boostLoading} emptyMessage="No boost orders found" />
          </GlassCard>
        </>
      )}

      {/* ── Credit Modal ────────────────────────────────────────────── */}
      <Modal
        open={creditModalOpen}
        onOpenChange={(open) => { if (!open) closeModals(); }}
        title="Credit User"
        description={selectedUser ? `Add funds to ${selectedUser.user_email}` : ''}
      >
        <form onSubmit={handleCreditSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Amount (IDR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Enter amount"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Reason for credit"
            />
          </div>
          {creditMutation.isError && (
            <p className="text-red-400 text-sm">{creditMutation.error?.response?.data?.error || creditMutation.error?.message || 'Credit failed'}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={closeModals} className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all">Cancel</button>
            <button type="submit" disabled={isMutating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-success text-white rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50">
              {creditMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Credit
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Debit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={debitModalOpen}
        onOpenChange={(open) => { if (!open) closeModals(); }}
        title="Debit User"
        description={selectedUser ? `Deduct funds from ${selectedUser.user_email}` : ''}
      >
        <form onSubmit={handleDebitSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Amount (IDR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Enter amount"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Reason for debit"
            />
          </div>
          {debitMutation.isError && (
            <p className="text-red-400 text-sm">{debitMutation.error?.response?.data?.error || debitMutation.error?.message || 'Debit failed'}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={closeModals} className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all">Cancel</button>
            <button type="submit" disabled={isMutating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-error text-white rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50">
              {debitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Debit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
