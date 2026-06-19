import { useState } from 'react';
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

const MOCK_STATUS = {
  connected: true,
  queueSize: 23,
  postedToday: 147,
  failed: 2
};

const MOCK_QUEUE = [
  { id: 1, item: 'Affiliate offer #1234', scheduled: new Date(Date.now() + 1000 * 60 * 15), status: 'pending', channel: '@affiliate_deals' },
  { id: 2, item: 'Product review video', scheduled: new Date(Date.now() + 1000 * 60 * 45), status: 'pending', channel: '@reviews_daily' },
  { id: 3, item: 'Flash sale alert', scheduled: new Date(Date.now() + 1000 * 60 * 90), status: 'pending', channel: '@flash_alerts' },
  { id: 4, item: 'Weekly earnings report', scheduled: new Date(Date.now() + 1000 * 60 * 120), status: 'pending', channel: '@earnings_hub' },
  { id: 5, item: 'New offer announcement', scheduled: new Date(Date.now() + 1000 * 60 * 180), status: 'pending', channel: '@affiliate_deals' },
  { id: 6, item: 'Tutorial: How to track clicks', scheduled: new Date(Date.now() - 1000 * 60 * 30), status: 'failed', channel: '@tutorial_zone' },
  { id: 7, item: 'Top performer spotlight', scheduled: new Date(Date.now() + 1000 * 60 * 240), status: 'pending', channel: '@success_stories' },
];

export function Poster() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    channel: '',
    scheduleNow: true,
    scheduledTime: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Manual post:', formData);
    setModalOpen(false);
    setFormData({ message: '', channel: '', scheduleNow: true, scheduledTime: '' });
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
      header: 'Item',
      accessorKey: 'item',
      cell: ({ row }) => (
        <span className="text-sm text-white font-medium">{row.original.item}</span>
      ),
    },
    {
      header: 'Scheduled',
      accessorKey: 'scheduled',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">
            {formatRelativeTime(row.original.scheduled)}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        
        if (status === 'pending') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5 w-fit">
              <Clock className="w-3 h-3" />
              PENDING
            </span>
          );
        }
        
        if (status === 'posted') {
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
      header: 'Channel',
      accessorKey: 'channel',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400 font-mono">{row.original.channel}</span>
      ),
    },
  ];

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Status"
          value={MOCK_STATUS.connected ? 'Connected' : 'Disconnected'}
          accent={MOCK_STATUS.connected ? 'green' : 'red'}
          icon={MOCK_STATUS.connected ? CheckCircle2 : XCircle}
        />
        <StatCard
          label="Queue Size"
          value={MOCK_STATUS.queueSize.toString()}
          accent="yellow"
          icon={Clock}
        />
        <StatCard
          label="Posted Today"
          value={MOCK_STATUS.postedToday.toLocaleString()}
          accent="green"
          icon={MessageCircle}
        />
        <StatCard
          label="Failed Today"
          value={MOCK_STATUS.failed.toString()}
          accent={MOCK_STATUS.failed > 0 ? 'red' : 'green'}
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
        <DataTable data={MOCK_QUEUE} columns={columns} searchable={false} exportable={false} />
      </GlassCard>

      {MOCK_STATUS.connected && (
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
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors resize-none"
              placeholder="Enter your message here..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Supports Telegram markdown formatting
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Channel
            </label>
            <input
              type="text"
              required
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-primary transition-colors font-mono"
              placeholder="@channel_name"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:border-indigo-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.scheduleNow}
                onChange={(e) => setFormData({ ...formData, scheduleNow: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-black/30 text-indigo-primary focus:ring-indigo-primary focus:ring-offset-0"
              />
              <span className="text-sm text-slate-300">Post immediately</span>
            </label>
          </div>

          {!formData.scheduleNow && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                required={!formData.scheduleNow}
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-primary transition-colors"
              />
            </div>
          )}

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
              {formData.scheduleNow ? 'Post Now' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
