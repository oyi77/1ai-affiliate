import { formatCurrency, formatIDR } from "../lib/currency";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { StatCard } from '../components/ui/StatCard';
import { DollarSign, ShoppingCart, TrendingUp, Target, Download } from 'lucide-react';
import api from '../lib/api';

function fmtRp(n) {
  const val = Number(n) || 0;
  return formatIDR(val);
}

function roasColor(roas) {
  const n = Number(roas) || 0;
  if (n >= 2) return 'text-green-success';
  if (n >= 1) return 'text-yellow-warning';
  return 'text-red-error';
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function LaporanIklan() {
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());
  const [advertiserId, setAdvertiserId] = useState('');
  const [trafficSourceId, setTrafficSourceId] = useState('');

  const { data: advertisers } = useQuery({
    queryKey: ['advertisers-min'],
    queryFn: async () => {
      const res = await api.get('/api/admin/advertisers');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const { data: trafficSources } = useQuery({
    queryKey: ['traffic-sources-min'],
    queryFn: async () => {
      const res = await api.get('/api/admin/traffic-sources');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['laporan-iklan', dateFrom, dateTo, advertiserId, trafficSourceId],
    queryFn: async () => {
      const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
      if (advertiserId) params.set('advertiser_id', advertiserId);
      if (trafficSourceId) params.set('traffic_source_id', trafficSourceId);
      const res = await api.get(`/api/admin/reports/ads?${params}`);
      return res.data?.data ?? res.data ?? [];
    },
  });

  const rows = Array.isArray(reportData) ? reportData : [];
  const totals = rows.reduce((acc, r) => ({
    spend: acc.spend + (Number(r.spend) || 0),
    komisi: acc.komisi + (Number(r.komisi) || 0),
    profit: acc.profit + (Number(r.net_profit) || 0),
    clicks: acc.clicks + (Number(r.clicks) || 0),
    orders: acc.orders + (Number(r.orders) || 0),
  }), { spend: 0, komisi: 0, profit: 0, clicks: 0, orders: 0 });

  const avgRoas = totals.spend > 0 ? (totals.komisi / totals.spend) : 0;

  const columns = [
    {
      header: 'Campaign',
      accessorKey: 'campaign_name',
      cell: ({ getValue }) => <span className="font-semibold text-white">{getValue() || '—'}</span>,
    },
    {
      header: 'Taglink',
      accessorKey: 'taglink',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono text-xs">{getValue() || '—'}</span>,
    },
    {
      header: 'Spend (Rp)',
      accessorKey: 'spend',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{fmtRp(getValue())}</span>,
    },
    {
      header: 'Komisi (Rp)',
      accessorKey: 'komisi',
      cell: ({ getValue }) => <span className="text-green-success font-mono">{fmtRp(getValue())}</span>,
    },
    {
      header: 'Net Profit (Rp)',
      accessorKey: 'net_profit',
      cell: ({ getValue }) => {
        const val = Number(getValue()) || 0;
        return <span className={`font-bold font-mono ${val >= 0 ? 'text-green-success' : 'text-red-error'}`}>{fmtRp(val)}</span>;
      },
    },
    {
      header: 'Orders',
      accessorKey: 'orders',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'ROAS',
      accessorKey: 'roas',
      cell: ({ row }) => {
        const spend = Number(row.original.spend) || 0;
        const komisi = Number(row.original.komisi) || 0;
        const roas = spend > 0 ? (komisi / spend).toFixed(2) : '0.00';
        return <span className={`font-bold font-mono ${roasColor(roas)}`}>{roas}x</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Iklan</h1>
          <p className="text-slate-400 mt-1">Meta Ads spend vs Shopee commission — merged view</p>
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
            if (advertiserId) params.set('advertiser_id', advertiserId);
            if (trafficSourceId) params.set('traffic_source_id', trafficSourceId);
            const token = localStorage.getItem('token');
            fetch(`/api/admin/reports/ads.pdf?${params}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.blob()).then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `laporan-iklan-${dateFrom}-${dateTo}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            });
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg text-sm font-bold hover:bg-indigo-light transition-all"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Spend" value={fmtRp(totals.spend)} icon={DollarSign} accent="red" />
        <StatCard label="Total Komisi" value={fmtRp(totals.komisi)} icon={ShoppingCart} accent="green" />
        <StatCard label="Total Profit" value={fmtRp(totals.profit)} icon={TrendingUp} accent={totals.profit >= 0 ? 'green' : 'red'} />
        <StatCard label="Avg ROAS" value={`${avgRoas.toFixed(2)}x`} icon={Target} accent={avgRoas >= 2 ? 'green' : avgRoas >= 1 ? 'yellow' : 'red'} />
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Advertiser</label>
            <select
              value={advertiserId}
              onChange={e => setAdvertiserId(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none min-w-[160px]"
            >
              <option value="">All Advertisers</option>
              {(advertisers || []).map(a => (
                <option key={a.id} value={a.id}>{a.user_name || a.name || `#${a.id}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Traffic Source</label>
            <select
              value={trafficSourceId}
              onChange={e => setTrafficSourceId(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none min-w-[160px]"
            >
              <option value="">All Sources</option>
              {(trafficSources || []).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Data table */}
      <GlassCard>
        <DataTable columns={columns} data={rows} isLoading={isLoading} />
      </GlassCard>
    </div>
  );
}
