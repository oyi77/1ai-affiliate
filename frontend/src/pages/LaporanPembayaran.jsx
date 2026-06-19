import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { CreditCard, Plus, Loader2, DollarSign } from 'lucide-react';
import api from '../lib/api';

function fmtRp(n) {
  return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export function LaporanPembayaran() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    report_id: '',
    akun_shopee: '',
    nominal: '',
    issued_date: today(),
    bank_account: '',
    note: '',
  });
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['shopee-payouts'],
    queryFn: async () => {
      const res = await api.get('/api/admin/advertisers/0/payouts');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/advertisers/0/payouts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-payouts'] });
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create payout'),
  });

  function resetForm() {
    setFormData({ report_id: '', akun_shopee: '', nominal: '', issued_date: today(), bank_account: '', note: '' });
    setFormError('');
  }

  function handleSave() {
    if (!formData.report_id.trim() || !formData.nominal) {
      setFormError('Report ID and nominal are required');
      return;
    }
    createMutation.mutate({
      report_id: formData.report_id.trim(),
      amount: Number(formData.nominal),
      issued_date: formData.issued_date,
      bank_account: formData.bank_account.trim() || undefined,
      note: formData.note.trim() || undefined,
    });
  }

  const payoutList = Array.isArray(payouts) ? payouts : [];
  const totalPaid = payoutList.filter(p => p.status === 'paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPending = payoutList.filter(p => p.status === 'pending').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const columns = [
    {
      accessorKey: 'issued_date',
      header: 'TANGGAL',
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return <span className="text-slate-500">-</span>;
        const d = typeof v === 'string' ? new Date(v) : new Date(v * 1000);
        return <span className="text-slate-300 text-sm">{d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
      },
    },
    {
      accessorKey: 'report_id',
      header: 'ID LAPORAN',
      cell: ({ getValue }) => <span className="font-mono text-indigo-light">{getValue()}</span>,
    },
    {
      accessorKey: 'bank_account',
      header: 'AKUN SHOPEE',
      cell: ({ getValue }) => <span className="text-slate-300">{getValue() || '-'}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'NOMINAL',
      cell: ({ getValue }) => <span className="font-semibold text-white">{fmtRp(getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => {
        const status = String(getValue() || 'pending').toLowerCase();
        const colors = {
          pending: 'bg-yellow-warning/10 text-yellow-warning border-yellow-warning/20',
          paid: 'bg-green-success/10 text-green-success border-green-success/20',
          cancelled: 'bg-red-error/10 text-red-error border-red-error/20',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Laporan Pembayaran
          </h1>
          <p className="text-slate-400 mt-2">Shopee payout tracking and management</p>
        </div>
        <button
          onClick={() => { resetForm(); setCreateModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg text-sm font-bold hover:bg-indigo-light transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Paid</p>
              <h3 className="text-2xl font-bold text-green-success">{fmtRp(totalPaid)}</h3>
            </div>
            <div className="p-2 bg-green-success/10 rounded-lg text-green-success">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-warning">{fmtRp(totalPending)}</h3>
            </div>
            <div className="p-2 bg-yellow-warning/10 rounded-lg text-yellow-warning">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Records</p>
              <h3 className="text-2xl font-bold text-white">{payoutList.length}</h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <DataTable data={payoutList} columns={columns} isLoading={isLoading} />

      <Modal
        open={createModalOpen}
        onOpenChange={(v) => { if (!v) setCreateModalOpen(false); }}
        title="Add Payout Record"
        description="Record a Shopee payout transaction."
      >
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">ID Laporan</label>
              <input
                type="text"
                value={formData.report_id}
                onChange={e => setFormData({ ...formData, report_id: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
                placeholder="RPT-2026-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Nominal (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.nominal}
                onChange={e => setFormData({ ...formData, nominal: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
                placeholder="500000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Tanggal</label>
              <input
                type="date"
                value={formData.issued_date}
                onChange={e => setFormData({ ...formData, issued_date: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Akun Shopee / Bank</label>
              <input
                type="text"
                value={formData.bank_account}
                onChange={e => setFormData({ ...formData, bank_account: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
                placeholder="BCA ****1234"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Catatan</label>
            <textarea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="input-field w-full h-20 resize-none"
              placeholder="Optional note..."
            />
          </div>

          {formError && (
            <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">{formError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Payout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
