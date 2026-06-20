import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  BookOpen, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Mail
} from 'lucide-react';

const faqs = [
  {
    q: 'How do I create a tracking link?',
    a: 'Navigate to Smartlinks in the sidebar, click "New Smartlink", select your offer, configure the destination, and generate your unique tracking URL.',
  },
  {
    q: 'How do I set up postback tracking?',
    a: 'Go to Settings > API Access to find your postback URL. Configure it in your affiliate network with the required parameters: {aff_id}, {payout}, {status}, {click_id}.',
  },
  {
    q: 'How do I add a custom domain?',
    a: 'Navigate to Infrastructure > Custom Domains, click "Add Domain", enter your domain name, and configure your DNS to point to our servers. SSL certificates are auto-provisioned.',
  },
  {
    q: 'How do I interpret my analytics?',
    a: 'The Analytics dashboard shows your clicks, conversions, revenue, and key metrics like EPC (Earnings Per Click) and CR (Conversion Rate). Use the date range selector to compare periods.',
  },
  {
    q: 'How does the AI tool work?',
    a: 'The AI Creative Tools use Gemini to generate marketing content. Simply select a tool, fill in the required fields, and click Generate. Results can be copied and used directly.',
  },
];

export function Help() {
  const { settings } = useSettings();
  const supportEmail = settings.support_email || 'support@berkahkarya.org';
  const statusUrl = settings.status_page_url || 'https://status.berkahkarya.org';
  const changelogUrl = settings.changelog_url || 'https://changelog.berkahkarya.org';
  const communityUrl = settings.community_url || 'https://community.berkahkarya.org';
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Help & Support
        </h1>
        <p className="text-slate-400 mt-2">Find answers and get assistance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="cursor-pointer group" onClick={() => window.location.href = `mailto:${supportEmail}`}>
          <BookOpen className="w-8 h-8 text-indigo-light mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Documentation</h3>
          <p className="text-slate-400 text-sm">Comprehensive guides and API reference</p>
        </GlassCard>

        <GlassCard className="cursor-pointer group" onClick={() => window.location.href = `mailto:${supportEmail}`}>
          <MessageCircle className="w-8 h-8 text-green-success mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
          <p className="text-slate-400 text-sm">Chat with our support team in real-time</p>
        </GlassCard>

        <GlassCard className="cursor-pointer group">
          <Mail className="w-8 h-8 text-yellow-warning mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Email Support</h3>
          <p className="text-slate-400 text-sm"><a href={`mailto:${supportEmail}`} className="text-yellow-warning hover:underline">{supportEmail}</a> — 24h response time</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-white">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
        <div className="space-y-2">
          {[
            { label: 'API Documentation', href: '/api-docs' },
            { label: 'Status Page', href: statusUrl },
            { label: 'Changelog', href: changelogUrl },
            { label: 'Community Forum', href: communityUrl },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              {link.label}
            </a>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
