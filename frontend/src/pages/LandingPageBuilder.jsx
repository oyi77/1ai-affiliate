import { useState } from 'react';
import { Copy, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

const templates = [
  { id: 'sweep', name: 'Sweepstakes Classic', icon: '🎁' },
  { id: 'diet', name: 'Diet/Health VSL', icon: '💊' },
  { id: 'casino', name: 'Casino Landing', icon: '🎰' },
  { id: 'crypto', name: 'Crypto Exchange', icon: '💰' },
  { id: 'ecommerce', name: 'Product Single', icon: '🛍️' },
  { id: 'dating', name: 'Social/Dating', icon: '💕' },
];

export function LandingPageBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [config, setConfig] = useState({
    title: 'Win an iPhone 15 Pro!',
    cta: 'Enter Now',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    pixelCode: '',
  });
  const [, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setModalOpen(true);
  };

  const generateHtml = () => {
    if (!selectedTemplate) return '<!-- Select a template to preview -->';
    return `<!DOCTYPE html>
<html>
<head>
    <title>${config.title}</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; background: #111; color: white; }
        .hero { padding: 60px 20px; text-align: center; background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor}); }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        .cta-btn { display: inline-block; padding: 15px 40px; background: white; color: black; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.2rem; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>${config.title}</h1>
        <a href="https://track.1ai.aff/go" class="cta-btn">${config.cta}</a>
    </div>
    ${config.pixelCode}
</body>
</html>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateHtml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Landing Page Builder
          </h1>
          <p className="text-slate-400 mt-2">Create high-converting landing pages in minutes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <GlassCard
            key={template.id}
            className={`cursor-pointer hover:border-indigo-primary transition-all ${
              selectedTemplate?.id === template.id ? 'border-indigo-primary shadow-glow' : ''
            }`}
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="h-40 bg-surface-3 rounded-lg flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden group">
              <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                {template.icon}
              </div>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold bg-indigo-primary px-4 py-2 rounded-lg">Configure</span>
              </div>
            </div>
            <h3 className="font-bold text-white">{template.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Professional design template</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-xl font-bold text-white mb-4">Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Page Title</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">CTA Text</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                value={config.cta}
                onChange={(e) => setConfig({ ...config, cta: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tracking Pixel Code</label>
              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm h-24 resize-none"
                placeholder="<script>...</script>"
                value={config.pixelCode}
                onChange={(e) => setConfig({ ...config, pixelCode: e.target.value })}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Preview</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-surface-3 hover:bg-indigo-primary/20 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-success" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>
          </div>
          <div className="h-[400px] bg-white rounded-lg overflow-hidden border border-white/10 relative">
            {selectedTemplate ? (
              <div className="w-full h-full opacity-80 bg-slate-200">
                 {/* Simplified Preview Overlay */}
                 <div 
                   className="w-full h-40 flex items-center justify-center text-black font-bold text-2xl"
                   style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
                 >
                   {config.title}
                 </div>
                 <div className="p-6 text-center">
                   <div 
                     className="inline-block px-8 py-3 rounded-full text-white font-bold"
                     style={{ backgroundColor: config.primaryColor }}
                   >
                     {config.cta}
                   </div>
                 </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a template to see preview</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
