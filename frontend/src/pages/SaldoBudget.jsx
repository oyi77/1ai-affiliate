import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { Wallet, TrendingDown, TrendingUp, Plus, Minus, Loader2, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../lib/api';

function fmtRp(n) {
  return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
}

export function SaldoBudget() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('deposit');
  const [formData, setFormData] = useState({ amount: '', note: '', traffic_source_id: '' });
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const { data: summary } = useQuery({
    queryKey: ['balance-summary'],
    queryFn: async () => {
      const res = await api.get('/api/admin/balance/summary');
      return res.data?.data ?? res.data;
    },
  });

  const { data: ledger, isLoading } = useQuery({
    queryKey: ['balance-ledger'],
    queryFn: async () => {
      const res = await api.get('/api/admin/balance');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/balance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['balance-ledger'] });
      setModalOpen(false);
      setFormData({ amount: '', note: '', traffic_source_id: '' });
      setFormError('');
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to record transaction'),
  });

  function openModal(type) {
    setModalType(type);
    setFormData({ amount: '', note: '', traffic_source_id: '' });
    setFormError('');
    setModalOpen(true);
  }

  function handleSave() {
    const amount = Number(formData.amount);
    if (!amount || amount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    addMutation.mutate({
      amount: modalType === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount),
      type: modalType,
      note: formData.note.trim() || undefined,
      traffic_source_id: formData.traffic_source_id ? Number(formData.traffic_source_id) : undefined,
    });
  }

  const ledgerList = Array.isArray(ledger) ? ledger : [];
  const totalDeposits = summary?.total_deposits ?? ledgerList.filter(r => r.type === 'deposit').reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalWithdrawals = summary?.total_withdrawals ?? ledgerList.filter(r => r.type === 'withdrawal').reduce((s, r) => s + Math.abs(Number(r.amount) || 0), 0);
  const totalSpend = summary?.total_spend ?? ledgerList.filter(r => r.type === 'spend').reduce((s, r) => s + Math.abs(Number(r.amount) || 0), 0);
  const currentBalance = summary?.balance ?? (totalDeposits - totalWithdrawals - totalSpend);

  const columns = [
    {
      accessorKey: 'created_at',
      header: 'TANGGAL',
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
      header: 'TIPE',
      cell: ({ getValue }) => {
        const t = String(getValue() || '').toLowerCase();
        const cfg = {
          deposit: { icon: ArrowUpCircle, color: 'text-green-success', bg: 'bg-green-success/10', label: 'Deposit' },
          withdrawal: { icon: ArrowDownCircle, color: 'text-red-error', bg: 'bg-red-error/10', label: 'Withdrawal' },
          spend: { icon: TrendingDown, color: 'text-yellow-warning', bg: 'bg-yellow-warning/10', label: 'Spend' },
          adjustment: { icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Adjustment' },
        };
        const c = cfg[t] || cfg.adjustment;
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
      header: 'NOMINAL',
      cell: ({ getValue, row }) => {
        const val = Number(getValue()) || 0;
        const isPositive = row.original.type === 'deposit' || val > 0;
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-success' : 'text-red-error'}`}>
            {isPositive ? '+' : ''}{fmtRp(val)}
          </span>
        );
      },
    },
    {
      accessorKey: 'note',
      header: 'CATATAN',
      cell: ({ getValue }) => <span className="text-slate-400 text-sm">{getValue() || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Saldo & Budget
          </h1>
          <p className="text-slate-400 mt-2">Balance overview, deposits, and withdrawals</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('deposit')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-success/20 text-green-success border border-green-success/30 rounded-lg text-sm font-bold hover:bg-green-success/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={() => openModal('withdrawal')}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-error/20 text-red-error border border-red-error/30 rounded-lg text-sm font-bold hover:bg-red-error/30 transition-all"
          >
            <Minus className="w-4 h-4" />
            Withdrawal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Current Balance</p>
              <h3 className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-white' : 'text-red-error'}`}>
                {fmtRp(currentBalance)}
              </h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Deposits</p>
              <h3 className="text-2xl font-bold text-green-success">{fmtRp(totalDeposits)}</h3>
            </div>
            <div className="p-2 bg-green-success/10 rounded-lg text-green-success">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Withdrawals</p>
              <h3 className="text-2xl font-bold text-red-error">{fmtRp(totalWithdrawals)}</h3>
            </div>
            <div className="p-2 bg-red-error/10 rounded-lg text-red-error">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Spend</p>
              <h3 className="text-2xl font-bold text-yellow-warning">{fmtRp(totalSpend)}</h3>
            </div>
            <div className="p-2 bg-yellow-warning/10 rounded-lg text-yellow-warning">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Deposit Ledger</h3>
        <DataTable data={ledgerList} columns={columns} isLoading={isLoading} />
      </GlassCard>

      <Modal
        open={modalOpen}
        onOpenChange={(v) => { if (!v) setModalOpen(false); }}
        title={modalType === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
        description={modalType === 'deposit' ? 'Add funds to your account balance.' : 'Record a withdrawal from your account.'}
      >
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Amount (Rp)</label>
            <input
              type="number"
              min="1"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
              placeholder="100000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Note</label>
            <input
              type="text"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
              placeholder="Bank transfer BCA..."
            />
          </div>

          {formError && (
            <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">{formError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={addMutation.isPending}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg disabled:opacity-50 transition-all text-white ${
                modalType === 'deposit'
                  ? 'bg-green-success shadow-green-success/20 hover:bg-green-success/80'
                  : 'bg-red-error shadow-red-error/20 hover:bg-red-error/80'
              }`}
            >
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {modalType === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
