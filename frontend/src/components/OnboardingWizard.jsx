import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Building2, Radio, Layers, FileText, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    icon: Building2,
    title: 'Create Advertiser',
    description: 'Set up your first advertiser to track commissions from affiliate networks like Shopee, Tokopedia, or Lazada.',
    href: '/advertisers',
    buttonText: 'Go to Advertisers',
  },
  {
    icon: Radio,
    title: 'Add Traffic Source',
    description: 'Connect your traffic sources — Meta Ads, Google Ads, TikTok, or custom platforms — to track ad spend.',
    href: '/traffic-sources',
    buttonText: 'Go to Traffic Sources',
  },
  {
    icon: Layers,
    title: 'Create Offer',
    description: 'Define an offer with payout, URL, and caps. Link it to a campaign for tracking.',
    href: '/offers',
    buttonText: 'Go to Offers',
  },
  {
    icon: FileText,
    title: 'Upload Report',
    description: 'Upload your advertiser commission report (CSV) to track earnings alongside ad spend.',
    href: '/advertisers',
    buttonText: 'Go to Advertisers',
  },
  {
    icon: BarChart3,
    title: 'View Report',
    description: 'See your merged Laporan Iklan — Meta Ads spend vs commission revenue, with ROAS analysis.',
    href: '/laporan-iklan',
    buttonText: 'View Laporan Iklan',
  },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  function handleSkip() {
    localStorage.setItem('onboarding_completed', '1');
    setVisible(false);
  }

  function handleGo() {
    navigate(step.href);
  }

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-1 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="text-sm text-slate-400">
            Step {currentStep + 1} of {STEPS.length}
          </div>
          <button onClick={handleSkip} className="p-1 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 mb-6">
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-6 pb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-primary/10 flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-indigo-light" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{step.description}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGo}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all"
              >
                {step.buttonText}
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-3 bg-surface-3 text-slate-300 rounded-lg font-medium hover:bg-surface-2 transition-all"
              >
                {currentStep < STEPS.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="w-full mt-4 text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip onboarding
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
