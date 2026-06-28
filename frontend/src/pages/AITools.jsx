import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Palette,
  Lightbulb,
  Scissors,
  Loader2,
  DollarSign,
  Wallet,
  AlertTriangle,
} from 'lucide-react';

const tools = [
  {
    id: 'banner',
    name: 'Banner Generator',
    description: 'Generate engaging HTML5 banner concepts for your affiliate offers',
    icon: ImageIcon,
    color: 'indigo',
    fields: [
      { name: 'product', label: 'Product Name', placeholder: 'iPhone 15 Pro' },
      { name: 'audience', label: 'Target Audience', placeholder: 'Tech enthusiasts, ages 25-40' },
      { name: 'cta', label: 'Call to Action', placeholder: 'Shop Now' },
    ],
  },
  {
    id: 'carousel',
    name: 'IG Carousel Generator',
    description: 'Create multi-slide Instagram carousel concepts',
    icon: Palette,
    color: 'pink',
    fields: [
      { name: 'topic', label: 'Topic', placeholder: 'Top 5 Summer Tech Gadgets' },
      { name: 'slides', label: 'Number of Slides', placeholder: '5', type: 'number' },
    ],
  },
  {
    id: 'caption',
    name: 'Social Captions',
    description: 'Generate engaging social media captions',
    icon: FileText,
    color: 'blue',
    fields: [
      { name: 'product', label: 'Product', placeholder: 'Wireless Earbuds' },
      { name: 'platform', label: 'Platform', placeholder: 'Instagram' },
      { name: 'tone', label: 'Tone', placeholder: 'Casual and fun' },
    ],
  },
  {
    id: 'brand-kit',
    name: 'Brand Kit Generator',
    description: 'Generate comprehensive brand identity kits',
    icon: Sparkles,
    color: 'purple',
    fields: [
      { name: 'brand_name', label: 'Brand Name', placeholder: 'TechStore' },
      { name: 'industry', label: 'Industry', placeholder: 'Consumer Electronics' },
      { name: 'vibe', label: 'Brand Vibe', placeholder: 'Innovation, Quality, Trust' },
    ],
  },
  {
    id: 'ab-test',
    name: 'A/B Test Ideas',
    description: 'Generate creative A/B testing hypotheses',
    icon: Lightbulb,
    color: 'yellow',
    fields: [
      { name: 'product', label: 'Product/Service', placeholder: 'Landing Page' },
      { name: 'audience', label: 'Target Audience', placeholder: 'Email signups' },
    ],
  },
  {
    id: 'bg-remove',
    name: 'BG Removal Prompt',
    description: 'Generate prompts for AI background removal',
    icon: Scissors,
    color: 'green',
    fields: [
      { name: 'image_subject', label: 'Image Subject', placeholder: 'Product photo of a sneaker' },
      { name: 'intent', label: 'Intent', placeholder: 'E-commerce listing' },
    ],
  },
];

export function AITools() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [formData, setFormData]         = useState({});
  const [result, setResult]             = useState(null);
  const [lowBalance, setLowBalance]     = useState(false);

  const { data: pricingData } = useQuery({
    queryKey: ['wallet-pricing'],
    queryFn: async () => (await api.get('/api/wallet/pricing')).data?.data ?? {},
    staleTime: 5 * 60_000,
  });
  const { data: walletData } = useQuery({
    queryKey: ['wallet-summary'],
    queryFn: async () => (await api.get('/api/wallet')).data?.data ?? null,
    staleTime: 30_000,
  });

  const pricing = pricingData ?? {};
  const balance = walletData?.balance ?? 0;

  function fmtRp(n) {
    return Number(n).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  }

  const generateMutation = useMutation({
    mutationFn: async ({ toolId, data }) =>
      (await api.post(`/api/content/${toolId}`, data)).data?.data,
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      if (err.response?.status === 402) setLowBalance(true);
      setResult({ error: err.response?.data?.error || 'Generation failed' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLowBalance(false);
    const cost = pricing[selectedTool?.pricingKey]?.price ?? 0;
    if (cost > 0 && balance < cost) { setLowBalance(true); return; }
    generateMutation.mutate({ toolId: selectedTool.id, data: formData });
  };

  const colorClasses = {
    indigo: 'from-indigo-primary to-indigo-light',
    pink:   'from-pink to-purple-600',
    blue:   'from-blue to-indigo-primary',
    purple: 'from-purple to-pink',
    yellow: 'from-yellow-warning to-yellow-600',
    green:  'from-green-success to-green-600',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AI Creative Tools</h1>
          <p className="text-slate-400 mt-2">Generate high-converting content with AI-powered tools</p>
        </div>
        {walletData && (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-lg border border-white/10">
            <Wallet className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-slate-300 font-medium">{fmtRp(balance)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const cost = pricing[tool.pricingKey]?.price ?? null;
          return (
            <GlassCard
              key={tool.id}
              className="cursor-pointer group relative overflow-hidden"
              onClick={() => { setSelectedTool(tool); setFormData({}); setResult(null); setLowBalance(false); }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[tool.color]} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[tool.color]} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                  {cost !== null && (
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-300 bg-indigo-primary/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
                      <DollarSign className="w-3 h-3" />{fmtRp(cost)}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{tool.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 group-hover:text-indigo-light transition-colors">
                  <Sparkles className="w-4 h-4" /><span>Click to generate</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <Modal
        open={!!selectedTool}
        onOpenChange={(open) => !open && setSelectedTool(null)}
        title={selectedTool?.name}
        description={selectedTool?.description}
        size="lg"
      >
        {selectedTool && (() => {
          const cost = pricing[selectedTool.pricingKey]?.price ?? 0;
          const canAfford = cost === 0 || balance >= cost;
          return (
            <div className="space-y-6">
              {cost > 0 && (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${canAfford ? 'bg-indigo-primary/10 border-indigo-primary/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <span className="text-sm text-slate-300">Cost: <strong className="text-white">{fmtRp(cost)}</strong></span>
                  <span className={`text-sm font-medium ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                    <Wallet className="inline w-3.5 h-3.5 mr-1" />Balance: {fmtRp(balance)}
                  </span>
                </div>
              )}
              {(lowBalance || (!canAfford && cost > 0)) && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <div className="text-sm">
                    <p className="text-red-300 font-medium">Insufficient balance</p>
                    <p className="text-slate-400">Need {fmtRp(Math.max(0, cost - balance))} more. <a href="/wallet" className="text-indigo-400 hover:underline">Topup now →</a></p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedTool.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={generateMutation.isPending || (!canAfford && cost > 0)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
                >
                  {generateMutation.isPending
                    ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</>
                    : <><Sparkles className="w-5 h-5" />Generate{cost > 0 ? ` (${fmtRp(cost)})` : ''}</>
                  }
                </button>
              </form>
              {result && (
                <div className="mt-6 p-6 bg-black/40 border border-white/10 rounded-lg">
                  <div className="text-sm font-bold text-slate-400 uppercase mb-3">Result</div>
                  {result?.error
                    ? <div className="text-red-400 text-sm font-medium">{result.error}</div>
                    : <pre className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result, null, 2)}</pre>
                  }
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
