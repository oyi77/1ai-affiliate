import { LayoutDashboard, Target, Layers, Link as LinkIcon, Users,
  DollarSign, Settings, Menu, X, Search, ChevronRight, ChevronDown,
  Sparkles, BarChart3, Shield, Crown, HelpCircle,
  Globe, Server, TrendingUp, Eye, Clock, FileText,
  Globe2, Radio, Zap, Building2, GitMerge, BarChart2, Bell, ShoppingCart, Wallet, CreditCard, Webhook,
  Route, BarChartHorizontal, FlaskConical, PieChart, Activity, Database, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

const navigation = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
      { name: 'Real-Time', icon: Activity, href: '/realtime' },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { name: 'Campaigns', icon: Target, href: '/campaigns' },
      { name: 'Offers', icon: Layers, href: '/offers' },
      { name: 'Affiliates', icon: Users, href: '/affiliates' },
      { name: 'Advertisers', icon: Building2, href: '/advertisers' },
      { name: 'Traffic Sources', icon: Radio, href: '/traffic-sources' },
    ],
  },
  {
    label: 'Links',
    items: [
      { name: 'Smartlinks', icon: LinkIcon, href: '/smartlinks' },
      { name: 'Deep Links', icon: LinkIcon, href: '/deep-links' },
      { name: 'Landing Pages', icon: FileText, href: '/landing-pages' },
      { name: 'Postback Builder', icon: Zap, href: '/postback-builder' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Overview', icon: BarChart3, href: '/analytics' },
      { name: 'Reports', icon: FileText, href: '/reports' },
      { name: 'Ad Performance', icon: BarChart2, href: '/laporan-iklan' },
      { name: 'Daily Analytics', icon: TrendingUp, href: '/analytic-harian' },
      { name: 'Link Performance', icon: LinkIcon, href: '/laporan-taglink' },
      { name: 'Attribution', icon: TrendingUp, href: '/attribution' },
      { name: 'Click Tracker', icon: Eye, href: '/click-tracker' },
      { name: 'A/B Tests', icon: FlaskConical, href: '/ab-tests' },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { name: 'Earnings', icon: DollarSign, href: '/earnings' },
      { name: 'Commissions', icon: DollarSign, href: '/commissions' },
      { name: 'Conversion Log', icon: ShoppingCart, href: '/conversion-log' },
      { name: 'Orders', icon: ShoppingCart, href: '/laporan-order' },
      { name: 'Payments', icon: CreditCard, href: '/laporan-pembayaran' },
      { name: 'Balance & Budget', icon: Wallet, href: '/saldo-budget' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'AI Tools', icon: Sparkles, href: '/ai-tools' },
      { name: 'Automation', icon: Zap, href: '/automation' },
      { name: 'Day-Parting', icon: Clock, href: '/day-parting' },
      { name: 'Integrations', icon: Layers, href: '/integrations' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Domains', icon: Globe, href: '/domains' },
      { name: 'Webhooks', icon: Webhook, href: '/webhooks' },
      { name: 'Pipeline', icon: Radio, href: '/pipeline' },
      { name: 'Settings', icon: Settings, href: '/settings' },
      { name: 'Admin', icon: Shield, href: '/admin' },
      { name: 'Template Manager', icon: FileText, href: '/template-manager' },
      { name: 'Migration', icon: Database, href: '/migration' },
      { name: 'API Docs', icon: FileText, href: '/api-docs' },
    ],
  },
];

export function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({});

  // Auto-expand group containing current route
  useEffect(() => {
    for (const group of navigation) {
      if (group.items.some(item => item.href === location.pathname)) {
        setExpanded(e => ({ ...e, [group.label]: true }));
        break;
      }
    }
  }, [location.pathname]);

  const toggleGroup = (label) => {
    setExpanded(e => ({ ...e, [label]: !e[label] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-[280px] bg-surface-1 border-r border-white/[0.06] z-50 lg:translate-x-0 overflow-y-auto flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">1</div>
            <span className="text-lg font-bold text-white">1ai</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navigation.map((group) => {
            const hasActive = group.items.some(i => i.href === location.pathname);
            const isOpen = expanded[group.label] ?? hasActive;

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                    hasActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {group.label}
                  <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 mt-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                active
                                  ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                              }`}
                            >
                              <Icon size={16} className={active ? 'text-indigo-400' : 'text-gray-500'} />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
          <div className="text-xs text-gray-600 mt-2">v1.0.0</div>
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
      const res = await fetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } });
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
      await fetch('/api/admin/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(0);
    } catch {}
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
      <button onClick={() => { if (!open) fetchNotifications(); setOpen(!open); }}
        className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-md transition-colors">
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
              {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications</div>
              ) : notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/[0.04] ${n.read_at ? 'opacity-60' : ''}`}>
                  <p className="text-sm font-medium text-white truncate">{n.title}</p>
                  {n.message && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 1024) setSidebarOpen(true); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className={`transition-all duration-200 ${sidebarOpen ? 'lg:pl-[280px]' : ''}`}>
        <header className="sticky top-0 h-14 bg-bg/95 backdrop-blur-sm border-b border-white/[0.06] z-30 px-4 sm:px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-md transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Quick search..." className="bg-surface-2 border border-white/[0.06] rounded-md pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-accent/40 w-56" />
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 max-w-[1440px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
