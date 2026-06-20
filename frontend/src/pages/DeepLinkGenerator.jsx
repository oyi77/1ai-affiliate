import { useState } from 'react';
import { Link as LinkIcon, Copy, CheckCircle2, QrCode } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';

export function DeepLinkGenerator() {
  const [form, setForm] = useState({
    targetUrl: 'https://example.com/offer',
    affiliateId: '',
    subid1: '',
    subid2: '',
    subid3: '',
    subid4: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateLink = () => {
    const params = new URLSearchParams();
    if (form.affiliateId) params.append('aff_id', form.affiliateId);
    if (form.subid1) params.append('subid1', form.subid1);
    if (form.subid2) params.append('subid2', form.subid2);
    if (form.subid3) params.append('subid3', form.subid3);
    if (form.subid4) params.append('subid4', form.subid4);

    // In a real app, this would be a tracking domain redirect URL
    const link = `https://track.1ai.aff/dl?target=${encodeURIComponent(form.targetUrl)}&${params.toString()}`;
    setGeneratedLink(link);
    
    setHistory(prev => [
      { link, url: form.targetUrl, created_at: new Date().toISOString() },
      ...prev.slice(0, 9) // Keep last 10
    ]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns = [
    {
      header: 'Target',
      accessorKey: 'url',
      cell: ({ row }) => (
        <div className="text-slate-300 text-sm max-w-[200px] truncate">{row.original.url}</div>
      ),
    },
    {
      header: 'Generated Link',
      accessorKey: 'link',
      cell: ({ row }) => (
        <div className="text-indigo-light text-xs font-mono truncate max-w-[300px]">
          {row.original.link}
        </div>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <div className="text-slate-400 text-xs">
          {new Date(Number(row.original.created_at) * 1000).toLocaleTimeString()}
        </div>
      ),
    },
    {
      header: '',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <button
          onClick={() => {
            navigator.clipboard.writeText(row.original.link);
          }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Deep Link Generator
        </h1>
        <p className="text-slate-400 mt-2">Create trackable redirects for your campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-xl font-bold text-white mb-6">Generate Link</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Target URL</label>
              <input
                type="url"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm"
                placeholder="https://example.com/offer"
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Affiliate ID</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                placeholder="12345"
                value={form.affiliateId}
                onChange={(e) => setForm({ ...form, affiliateId: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">SubID {num}</label>
                  <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm"
                    value={form[`subid${num}`]}
                    onChange={(e) => setForm({ ...form, [`subid${num}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={generateLink}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light transition-all"
            >
              <LinkIcon className="w-5 h-5" />
              Generate Link
            </button>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Result</h3>
          
          {generatedLink ? (
            <div className="space-y-4">
              <div className="bg-surface-3/50 border border-white/5 rounded-lg p-4">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Generated URL</div>
                <div className="font-mono text-sm text-indigo-light break-all">
                  {generatedLink}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-3 hover:bg-indigo-primary/20 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-success" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-3 hover:bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all"
                  onClick={() => alert('QR Code generation coming soon!')}
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
              <LinkIcon className="w-12 h-12 mb-4 opacity-30" />
              <p>Generated link will appear here</p>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Recent History</h3>
        {history.length > 0 ? (
          <DataTable data={history} columns={columns} searchable={false} />
        ) : (
          <div className="text-center py-8 text-slate-500">No links generated yet in this session.</div>
        )}
      </GlassCard>
    </div>
  );
}
