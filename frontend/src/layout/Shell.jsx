import { useState } from 'react';
import {
  LayoutDashboard, Target, Layers, Link as LinkIcon, Users,
  DollarSign, Settings, Menu, X, Search, ChevronRight,
  Sparkles, BarChart3, Shield, Crown, HelpCircle,
  Globe, Server, TrendingUp, Eye, Clock, FileText,
  Globe2, Radio, Zap, Building2, GitMerge, BarChart2, Bell, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Campaigns', icon: Target, href: '/campaigns' },
  { name: 'Offers', icon: Layers, href: '/offers' },
  { name: 'Affiliates', icon: Users, href: '/affiliates' },
  { name: 'Affiliate Dashboard', icon: BarChart2, href: '/affiliate-dashboard' },
  { name: 'Advertisers', icon: Building2, href: '/advertisers' },
  { name: 'Traffic Sources', icon: Radio, href: '/traffic-sources' },
  { name: 'Smartlinks', icon: LinkIcon, href: '/smartlinks' },
  { name: 'Landing Pages', icon: FileText, href: '/landing-pages' },
  { name: 'Deep Links', icon: LinkIcon, href: '/deep-links' },
  { name: 'Postback Builder', icon: Zap, href: '/postback-builder' },
  { name: 'AI Tools', icon: Sparkles, href: '/ai-tools' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Attribution', icon: TrendingUp, href: '/attribution' },
  { name: 'Reports', icon: FileText, href: '/reports' },
  { name: 'Laporan Iklan', icon: FileText, href: '/laporan-iklan' },
  { name: 'Analytic Harian', icon: TrendingUp, href: '/analytic-harian' },
  { name: 'Laporan Taglink', icon: LinkIcon, href: '/laporan-taglink' },
  { name: 'Click Tracker', icon: Eye, href: '/click-tracker' },
  { name: 'Day-Parting', icon: Clock, href: '/day-parting' },
  { name: 'Earnings', icon: DollarSign, href: '/earnings' },
  { name: 'Conversion Log', icon: ShoppingCart, href: '/conversions' },
  { name: 'Manual Conversion', icon: GitMerge, href: '/conversions/manual' },
  { name: 'Commissions', icon: DollarSign, href: '/commissions' },
  { name: 'Domains', icon: Globe, href: '/domains' },
  { name: 'Shorteners', icon: LinkIcon, href: '/shorteners' },
  { name: 'Click Servers', icon: Server, href: '/click-servers' },
  { name: 'Integrations', icon: Layers, href: '/integrations' },
  { name: 'Pipeline', icon: Radio, href: '/pipeline' },
  { name: 'Poster', icon: Globe2, href: '/poster' },
  { name: 'Settings', icon: Settings, href: '/settings' },
  { name: 'API Docs', icon: FileText, href: '/api-docs' },
  { name: 'Admin', icon: Shield, href: '/admin' },
  { name: 'VIP Perks', icon: Crown, href: '/vip' },
  { name: 'Support', icon: HelpCircle, href: '/help' },
];

export function Sidebar({ open, setOpen }) {
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 h-full w-60 bg-surface-1 border-r border-white/[0.06] z-50 lg:translate-x-0 overflow-y-auto"
      >
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-6 mt-1">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center font-bold text-white text-sm">
              1A
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Affiliate Hub</span>
          </div>

          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-accent-subtle text-accent-light font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sticky bottom-0 w-full p-4 border-t border-white/[0.06] bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-slate-400 border border-white/[0.06] text-xs font-medium">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@1ai.com</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchNotifications() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications(n => n.map(x => ({ ...x, read_at: x.read_at || Math.floor(Date.now() / 1000) })));
    } catch {}
  }

  function handleClick() {
    if (!open) fetchNotifications();
    setOpen(!open);
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-md transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface-1 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-white/[0.04] ${n.read_at ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read_at && <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{n.title}</p>
                        {n.message && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>}
                        <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className={`transition-all duration-200 ${sidebarOpen ? 'lg:pl-60' : ''}`}>
        <header className="sticky top-0 h-14 bg-bg/95 backdrop-blur-sm border-b border-white/[0.06] z-30 px-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-md transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-surface-2 border border-white/[0.06] rounded-md pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-accent/40 w-56"
              />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
