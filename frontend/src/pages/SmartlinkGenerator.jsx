import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link as LinkIcon, 
  Settings, 
  Monitor, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Copy,
  Target,
  QrCode,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

const steps = [
  { id: 1, name: 'Offer', icon: Target },
  { id: 2, name: 'Configuration', icon: Settings },
  { id: 3, name: 'Customize', icon: Monitor },
  { id: 4, name: 'Preview', icon: CheckCircle2 },
];

export function SmartlinkGenerator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    offer: '',
    landingPage: '',
    domain: '',
    path: '',
    params: '',
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 py-4">
            <h3 className="text-xl font-semibold text-white">Select Offer</h3>
            <p className="text-slate-400">Choose the offer you want to promote with this smartlink.</p>
            <div className="space-y-3">
              {['iPhone 15 Pro - Sweepstakes', 'Weight Loss Supplement - VSL', 'Casino Welcome Bonus - EU'].map(offer => (
                <button
                  key={offer}
                  onClick={() => setFormData({ ...formData, offer })}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                    formData.offer === offer 
                      ? 'bg-indigo-primary/20 border-indigo-primary text-white shadow-glow' 
                      : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="font-medium">{offer}</span>
                  {formData.offer === offer && <CheckCircle2 className="w-5 h-5 text-indigo-light" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 py-4">
            <h3 className="text-xl font-semibold text-white">Configure Route</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Landing Page</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                  value={formData.landingPage}
                  onChange={e => setFormData({ ...formData, landingPage: e.target.value })}
                >
                  <option value="">Select a landing page...</option>
                  <option value="default">Default LP (Highest EPC)</option>
                  <option value="vsl">VSL Page (Direct Sale)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Custom Parameters (JSON)</label>
                <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white h-24 font-mono text-sm"
                  placeholder='{"subid1": "social", "source": "tiktok"}'
                  value={formData.params}
                  onChange={e => setFormData({ ...formData, params: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 py-4">
            <h3 className="text-xl font-semibold text-white">URL Customization</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Tracking Domain</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                  value={formData.domain}
                  onChange={e => setFormData({ ...formData, domain: e.target.value })}
                >
                  <option value="go.1ai.aff">go.1ai.aff (Default)</option>
                  <option value="click.mybrand.com">click.mybrand.com</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Slug / Path</label>
                <div className="flex items-center bg-black/20 border border-white/10 rounded-lg overflow-hidden">
                  <span className="px-3 text-slate-500 text-sm">{formData.domain || 'domain'}/</span>
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent p-3 text-white outline-none"
                    placeholder="my-cool-campaign"
                    value={formData.path}
                    onChange={e => setFormData({ ...formData, path: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 4: {
        const finalUrl = `https://${formData.domain || 'go.1ai.aff'}/${formData.path || 'track'}?offer_id=123`;
        return (
          <div className="space-y-8 py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-success" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Smartlink Ready!</h3>
              <p className="text-slate-400 mt-2">Your link has been generated and is ready to use.</p>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-3 rounded-lg border border-white/5">
                <code className="text-indigo-light text-sm truncate mr-4">{finalUrl}</code>
                <button onClick={() => navigator.clipboard.writeText(finalUrl).catch(() => {})} className="p-2 hover:bg-white/5 rounded-md transition-all text-slate-400 hover:text-white">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <button disabled title="Coming soon" className="flex flex-col items-center gap-2 text-slate-400 opacity-50 cursor-not-allowed transition-all">
                  <div className="p-3 bg-surface-3 rounded-lg border border-white/5">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">Get QR Code</span>
                </button>
                <button disabled title="Coming soon" className="flex flex-col items-center gap-2 text-slate-400 opacity-50 cursor-not-allowed transition-all">
                  <div className="p-3 bg-surface-3 rounded-lg border border-white/5">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">Test Link</span>
                </button>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <header className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white">Smartlink Generator</h2>
        <p className="text-slate-400 mt-2">Generate high-converting tracking links in seconds.</p>
      </header>

      <GlassCard className="relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-indigo-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Steps Info */}
        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map(s => (
            <div key={s.id} className={`flex flex-col items-center gap-2 ${step >= s.id ? 'text-indigo-light' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                step >= s.id ? 'border-indigo-primary bg-indigo-primary/10 shadow-glow' : 'border-slate-800'
              }`}>
                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{s.id}</span>}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest">{s.name}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={nextStep}
            disabled={step === 4 || (step === 1 && !formData.offer)}
            className="flex items-center gap-2 px-8 py-2 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {step === 3 ? 'Generate Link' : 'Next Step'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
