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
  Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign,
  Plus, Minus, Loader2, ArrowUpCircle, ArrowDownCircle, CreditCard,
} from 'lucide-react';

// ── Quick topup amounts (IDR) ─────────────────────────────────
const QUICK_AMOUNTS = [
  { label: '155K', value: 155000 },
  { label: '250K', value: 250000 },
  { label: '500K', value: 500000 },
  { label: '1M', value: 1000000 },
  { label: '2M', value: 2000000 },
  { label: '5M', value: 5000000 },
];

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'spending', label: 'Spending' },
  { key: 'boost', label: 'Boost Orders' },
];

// ── Type badge config for transaction rows ────────────────────
const TYPE_CFG = {
  deposit:     { icon: ArrowUpCircle,   color: 'text-green-success',  bg: 'bg-green-success/10',  label: 'Deposit' },
  withdrawal:  { icon: ArrowDownCircle,  color: 'text-red-error',      bg: 'bg-red-error/10',      label: 'Withdrawal' },
  spend:       { icon: TrendingDown,     color: 'text-yellow-warning', bg: 'bg-yellow-warning/10', label: 'Spend' },
  adjustment:  { icon: DollarSign,       color: 'text-blue-400',       bg: 'bg-blue-400/10',       label: 'Adjustment' },
};

// ── Withdraw method options ───────────────────────────────────
const WITHDRAW_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Crypto' },
];

// ── Component ─────────────────────────────────────────────────
export function Wallet() {
  const queryClient = useQueryClient();

  // ── Modals ────────────────────────────────────────────────
  const [topupOpen, setTopupOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // ── Topup form ────────────────────────────────────────────
  const [topupAmount, setTopupAmount] = useState('');
  const [topupGateway, setTopupGateway] = useState('');
  const [topupMethod, setTopupMethod] = useState('');
  const [topupError, setTopupError] = useState('');
  const [topupResult, setTopupResult] = useState(null);

  // ── Withdraw form ─────────────────────────────────────────
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // ── Tabs ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('transactions');

  // ── Transaction pagination ────────────────────────────────
  const [txPage, setTxPage] = useState(1);
  const txLimit = 50;

  // ── Queries ───────────────────────────────────────────────
  const { data: wallet, isLoading: walletLoading, isError: walletIsError, error: walletError, refetch: walletRefetch } = useSafeQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await api.get('/api/wallet');
      return res.data?.data ?? res.data;
    },
  }, {});

  const { data: txData, isLoading: txLoading } = useSafeQuery({
    queryKey: ['wallet-transactions', txPage],
    queryFn: async () => {
      const res = await api.get(`/api/wallet/transactions?page=${txPage}&limit=${txLimit}`);
      return res.data;
    },
  }, { data: [], page: 1, total: 0, pages: 1 });

  const { data: spendingData, isLoading: spendingLoading } = useSafeQuery({
    queryKey: ['wallet-spending'],
    queryFn: async () => {
      const res = await api.get('/api/wallet/spending?days=30');
      return res.data?.data ?? res.data ?? [];
    },
  }, []);

  const { data: gateways } = useSafeQuery({
    queryKey: ['payment-gateways'],
    queryFn: async () => {
      const res = await api.get('/api/payment/gateways');
      return (res.data?.data ?? res.data ?? []).filter(g => g.available);
    },
  }, []);

  // ── Derived ───────────────────────────────────────────────
  const balance = Number(wallet?.balance) || 0;
  const deposits = Number(wallet?.deposits) || 0;
  const withdrawals = Number(wallet?.withdrawals) || 0;
  const spending = Number(wallet?.spending) || 0;
  const minTopup = Number(wallet?.min_topup) || 155000;

  const transactions = Array.isArray(txData?.data) ? txData.data : [];
  const txTotal = txData?.total || 0;
  const txPages = txData?.pages || 1;

  const spendingList = Array.isArray(spendingData) ? spendingData : [];
  const spendingTotal = spendingList.reduce((s, r) => s + (Number(r.total) || 0), 0);

  const selectedGateway = gateways.find(g => g.id === topupGateway);

  // ── Mutations ─────────────────────────────────────────────
  const topupMutation = useMutation({
    mutationFn: (data) => api.post('/api/wallet/topup', data),
    onSuccess: (res) => {
      setTopupResult(res.data?.data ?? res.data);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
    onError: (err) => setTopupError(err.response?.data?.error || 'Failed to create topup'),
  });

  const withdrawMutation = useMutation({
    mutationFn: (data) => api.post('/api/wallet/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      closeWithdrawModal();
    },
    onError: (err) => setWithdrawError(err.response?.data?.error || 'Failed to process withdrawal'),
  });

  // ── Handlers ──────────────────────────────────────────────
  function openTopupModal() {
    setTopupAmount('');
    setTopupGateway('');
    setTopupMethod('');
    setTopupError('');
    setTopupResult(null);
    setTopupOpen(true);
  }

  function closeTopupModal() {
    setTopupOpen(false);
    setTopupResult(null);
  }

  function openWithdrawModal() {
    setWithdrawAmount('');
    setWithdrawMethod('bank_transfer');
    setWithdrawDetails('');
    setWithdrawError('');
    setWithdrawOpen(true);
  }

  function closeWithdrawModal() {
    setWithdrawOpen(false);
  }

  function handleTopup() {
    const amount = Number(topupAmount);
    if (!amount || amount < minTopup) {
      setTopupError(`Minimum topup is ${formatIDR(minTopup)}`);
      return;
    }
    if (!topupGateway) {
      setTopupError('Please select a payment gateway');
      return;
    }
    setTopupError('');
    topupMutation.mutate({
      amount,
      gateway: topupGateway,
      method: topupMethod || undefined,
    });
  }

  function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawError('Amount must be greater than 0');
      return;
    }
    if (amount > balance) {
      setWithdrawError('Amount exceeds available balance');
      return;
    }
    if (!withdrawDetails.trim()) {
      setWithdrawError('Please provide withdrawal details (account info)');
      return;
    }
    setWithdrawError('');
    withdrawMutation.mutate({
      amount,
      method: withdrawMethod,
      details: withdrawDetails.trim(),
    });
  }

  // ── Transaction table columns ─────────────────────────────
  const txColumns = [
    {
      accessorKey: 'created_at',
      header: 'DATE',
      cell: ({ getValue }) => {
        const v = getValue();
        const d = v ? new Date(v * 1000) : null;
        return (
          <span className="text-slate-300 text-sm">
            {d ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
          </span>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'TYPE',
      cell: ({ getValue }) => {
        const t = String(getValue() || '').toLowerCase();
        const c = TYPE_CFG[t] || TYPE_CFG.adjustment;
        const Icon = c.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {c.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'AMOUNT',
      cell: ({ getValue, row }) => {
        const val = Number(getValue()) || 0;
        const isPositive = row.original.type === 'deposit' || val > 0;
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-success' : 'text-red-error'}`}>
            {isPositive ? '+' : ''}{formatIDR(val)}
          </span>
        );
      },
    },
    {
      accessorKey: 'note',
      header: 'NOTE',
      cell: ({ getValue }) => <span className="text-slate-400 text-sm">{getValue() || '-'}</span>,
    },
  ];

  // ── Early error state ─────────────────────────────────────
  if (walletIsError && !walletLoading) {
    return <ErrorState error={walletError} onRetry={walletRefetch} />;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Wallet
          </h1>
          <p className="text-slate-400 mt-2">Manage your balance, top up, and track spending</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openTopupModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-success/20 text-green-success border border-green-success/30 rounded-lg text-sm font-bold hover:bg-green-success/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Topup
          </button>
          <button
            onClick={openWithdrawModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-error/20 text-red-error border border-red-error/30 rounded-lg text-sm font-bold hover:bg-red-error/30 transition-all"
          >
            <Minus className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Balance</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-error'}`}>
                {walletLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(balance)}
              </h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Deposits</p>
              <h3 className="text-2xl font-bold text-green-success">
                {walletLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(deposits)}
              </h3>
            </div>
            <div className="p-2 bg-green-success/10 rounded-lg text-green-success">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Withdrawals</p>
              <h3 className="text-2xl font-bold text-red-error">
                {walletLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(withdrawals)}
              </h3>
            </div>
            <div className="p-2 bg-red-error/10 rounded-lg text-red-error">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Spending</p>
              <h3 className="text-2xl font-bold text-yellow-warning">
                {walletLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : formatIDR(spending)}
              </h3>
            </div>
            <div className="p-2 bg-yellow-warning/10 rounded-lg text-yellow-warning">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
              activeTab === tab.key
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Transactions Tab ───────────────────────────────── */}
      {activeTab === 'transactions' && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4">Transactions</h3>
          <DataTable
            data={transactions}
            columns={txColumns}
            isLoading={txLoading}
            emptyMessage="No transactions yet"
          />
          {txPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-slate-400">
                Page {txPage} of {txPages} ({txTotal} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTxPage(p => Math.max(1, p - 1))}
                  disabled={txPage <= 1}
                  className="px-3 py-1.5 bg-surface-3 text-slate-300 rounded-lg text-sm hover:bg-surface-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setTxPage(p => Math.min(txPages, p + 1))}
                  disabled={txPage >= txPages}
                  className="px-3 py-1.5 bg-surface-3 text-slate-300 rounded-lg text-sm hover:bg-surface-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* ── Spending Tab ───────────────────────────────────── */}
      {activeTab === 'spending' && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4">Spending Breakdown (30 days)</h3>
          {spendingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : spendingList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No spending recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Feature</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Total Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Count</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingList.map((row, i) => {
                    const pct = spendingTotal > 0 ? ((row.total / spendingTotal) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={row.feature || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-white font-medium">{row.feature}</td>
                        <td className="py-3 px-4 text-right text-yellow-warning font-semibold">{formatIDR(row.total)}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{row.count}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td className="py-3 px-4 text-white font-bold">Total</td>
                    <td className="py-3 px-4 text-right text-yellow-warning font-bold">{formatIDR(spendingTotal)}</td>
                    <td className="py-3 px-4 text-right text-slate-300 font-bold">
                      {spendingList.reduce((s, r) => s + (Number(r.count) || 0), 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 font-bold">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* ── Boost Orders Tab ───────────────────────────────── */}
      {activeTab === 'boost' && (
        <GlassCard>
          <div className="text-center py-12 text-slate-400 text-sm">
            Boost orders will appear here once available.
          </div>
        </GlassCard>
      )}

      {/* ── Topup Modal ────────────────────────────────────── */}
      <Modal
        open={topupOpen}
        onOpenChange={(v) => { if (!v) closeTopupModal(); }}
        title="Top Up Wallet"
        description="Add funds to your wallet via payment gateway"
        size="md"
      >
        {topupResult ? (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-green-success/10 border border-green-success/20 rounded-lg text-center">
              <p className="text-green-success font-semibold mb-1">Topup Created!</p>
              <p className="text-slate-300 text-sm">
                Reference: <span className="font-mono text-white">{topupResult.reference}</span>
              </p>
              <p className="text-slate-300 text-sm">
                Amount: <span className="text-white font-semibold">{formatIDR(topupResult.amount)}</span>
              </p>
            </div>

            {topupResult.checkout_url && (
              <a
                href={topupResult.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-primary/80 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Proceed to Payment
              </a>
            )}

            {topupResult.qr_url && (
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Scan QR to pay:</p>
                <img src={topupResult.qr_url} alt="QR Code" className="mx-auto rounded-lg max-w-[200px]" />
              </div>
            )}

            {topupResult.pay_code && (
              <div className="p-3 bg-black/20 border border-white/10 rounded-lg text-center">
                <p className="text-slate-400 text-xs mb-1">Pay Code</p>
                <p className="text-white text-xl font-mono font-bold tracking-wider">{topupResult.pay_code}</p>
              </div>
            )}

            <button
              onClick={closeTopupModal}
              className="w-full px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Amount (IDR)</label>
              <input
                type="number"
                min={minTopup}
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
                placeholder={`Min. ${formatIDR(minTopup)}`}
              />
            </div>

            {/* Quick amount buttons */}
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map(qa => (
                <button
                  key={qa.value}
                  onClick={() => setTopupAmount(String(qa.value))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    Number(topupAmount) === qa.value
                      ? 'bg-indigo-primary text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Gateway selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Payment Gateway</label>
              <select
                value={topupGateway}
                onChange={e => { setTopupGateway(e.target.value); setTopupMethod(''); }}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none"
              >
                <option value="">Select gateway...</option>
                {gateways.map(gw => (
                  <option key={gw.id} value={gw.id}>{gw.icon} {gw.name}</option>
                ))}
              </select>
            </div>

            {/* Method selector (depends on gateway) */}
            {selectedGateway && selectedGateway.methods?.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Payment Method</label>
                <select
                  value={topupMethod}
                  onChange={e => setTopupMethod(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none"
                >
                  <option value="">Any method</option>
                  {selectedGateway.methods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Error */}
            {topupError && (
              <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">{topupError}</div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeTopupModal} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={topupMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg bg-green-success shadow-green-success/20 hover:bg-green-success/80 disabled:opacity-50 transition-all text-white"
              >
                {topupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Topup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Withdraw Modal ─────────────────────────────────── */}
      <Modal
        open={withdrawOpen}
        onOpenChange={(v) => { if (!v) closeWithdrawModal(); }}
        title="Withdraw Funds"
        description={`Available balance: ${formatIDR(balance)}`}
        size="md"
      >
        <div className="space-y-4 mt-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Amount (IDR)</label>
            <input
              type="number"
              min="1"
              max={balance}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
              placeholder="100000"
            />
            {balance > 0 && (
              <button
                onClick={() => setWithdrawAmount(String(balance))}
                className="text-xs text-indigo-light hover:text-indigo-primary transition-colors"
              >
                Withdraw all ({formatIDR(balance)})
              </button>
            )}
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Withdrawal Method</label>
            <select
              value={withdrawMethod}
              onChange={e => setWithdrawMethod(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none"
            >
              {WITHDRAW_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">
              {withdrawMethod === 'bank_transfer' ? 'Bank Account Details' :
               withdrawMethod === 'paypal' ? 'PayPal Email' :
               'Crypto Wallet Address'}
            </label>
            <textarea
              value={withdrawDetails}
              onChange={e => setWithdrawDetails(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary min-h-[80px] resize-none"
              placeholder={
                withdrawMethod === 'bank_transfer' ? 'BCA - 1234567890 - John Doe' :
                withdrawMethod === 'paypal' ? 'your@email.com' :
                'Your crypto wallet address'
              }
            />
          </div>

          {/* Error */}
          {withdrawError && (
            <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">{withdrawError}</div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeWithdrawModal} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg bg-red-error shadow-red-error/20 hover:bg-red-error/80 disabled:opacity-50 transition-all text-white"
            >
              {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Withdraw
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
