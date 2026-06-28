import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { 
  Users, 
  Server, 
  Activity, 
  UserPlus, 
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'affiliate' });
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/api/admin/users?limit=100');
      return response.data?.data ?? response.data ?? []
    },
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const response = await api.get('/api/admin/system');
      return response.data?.data ?? response.data
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/api/admin/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setCreateModalOpen(false);
      setNewUser({ username: '', email: '', password: '', role: 'affiliate' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const userColumns = [
    {
      header: 'User',
      accessorKey: 'user_name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-slate-400 border border-white/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-white">{row.original.user_name}</div>
            <div className="text-xs text-slate-500">{row.original.user_email}</div>
          </div>
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
      header: 'Status',
      accessorKey: 'user_active',
      cell: () => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-success" />
          <span className="text-slate-400">Active</span>
        </div>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'user_date_added',
      cell: ({ getValue }) => (
        <span className="text-slate-400 text-sm">
          {getValue() ? new Date(Number(getValue()) * 1000).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const statusItems = [
    { label: 'Database', status: systemStatus?.db === 'connected' ? 'ok' : 'error', detail: 'MySQL 8.0' },
    { label: 'Redis Cache', status: systemStatus?.redis === 'connected' ? 'ok' : 'warning', detail: 'In-memory' },
    { label: 'Gemini AI', status: systemStatus?.gemini ? 'ok' : 'warning', detail: 'Content generation' },
    { label: 'API Server', status: 'ok', detail: `Port ${systemStatus?.port || 3001}` },
  ];

  const StatusIcon = ({ status }) => {
    if (status === 'ok') return <CheckCircle2 className="w-5 h-5 text-green-success" />;
    if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-warning" />;
    return <XCircle className="w-5 h-5 text-red-error" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            System Admin
          </h1>
          <p className="text-slate-400 mt-2">Manage users, monitor system health, and oversee finances</p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-sm font-semibold">Total Users</div>
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-white">{users?.length || 0}</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-sm font-semibold">System Health</div>
            <Activity className="w-5 h-5 text-green-success" />
          </div>
          <div className="text-3xl font-bold text-green-success">OK</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-sm font-semibold">Uptime</div>
            <Server className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-white">{systemStatus?.uptime ?? '—'}</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-sm font-semibold">API Calls Today</div>
            <Shield className="w-5 h-5 text-indigo-light" />
          </div>
          <div className="text-3xl font-bold text-indigo-light">{systemStatus?.apiCallsToday ?? '—'}</div>
        </GlassCard>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {['users', 'finance', 'health', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-surface-2 text-white border-b-2 border-indigo-primary'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <DataTable data={users || []} columns={userColumns} />}

      {activeTab === 'finance' && (
        <div className="p-8 text-center text-slate-400 bg-surface-2 rounded-lg border border-white/10">
          <p className="mb-4">Financial management has moved to the dedicated Finance dashboard.</p>
          <a href="/finance" className="px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light inline-block transition-colors">
            Go to Finance Dashboard →
          </a>
        </div>
      )}

      {activeTab === 'health' && (
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">System Health</h3>
            <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['system-status'] }); queryClient.invalidateQueries({ queryKey: ['users'] }); }} className="p-2 text-slate-400 hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {statusItems.map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <StatusIcon status={item.status} />
                  <div>
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.detail}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase ${
                  item.status === 'ok' ? 'text-green-success' : 
                  item.status === 'warning' ? 'text-yellow-warning' : 'text-red-error'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'logs' && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity Logs</h3>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-slate-400 text-sm">No logs available.</p>
          </div>
        </GlassCard>
      )}

      <Modal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create New User"
        description="Add a new user to the system"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUserMutation.mutate(newUser);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="affiliate">Affiliate</option>
              <option value="advertiser">Advertiser</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex-1 px-4 py-2 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
