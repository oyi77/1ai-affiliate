import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  Book,
  Lock,
  BarChart3,
  Target,
  Gift,
  Users,
  DollarSign,
  CreditCard,
  Link2,
  Globe,
  FileCode,
  Sparkles
} from 'lucide-react';

const API_SECTIONS = [
  {
    id: 'auth',
    title: 'Authentication',
    icon: Lock,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate and obtain API token',
        params: [
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' },
        ],
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            email: 'user@example.com',
            role: 'affiliate'
          }
        }
      },
      {
        method: 'POST',
        path: '/api/auth/refresh',
        description: 'Refresh expired token',
        params: [
          { name: 'refresh_token', type: 'string', required: true, description: 'Refresh token' },
        ],
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_in: 3600
        }
      },
    ]
  },
  {
    id: 'stats',
    title: 'Statistics',
    icon: BarChart3,
    endpoints: [
      {
        method: 'GET',
        path: '/api/stats',
        description: 'Retrieve account statistics',
        params: [
          { name: 'start_date', type: 'string', required: false, description: 'Start date (YYYY-MM-DD)' },
          { name: 'end_date', type: 'string', required: false, description: 'End date (YYYY-MM-DD)' },
          { name: 'group_by', type: 'string', required: false, description: 'Group by: day, week, month' },
        ],
        response: {
          visits: 12543,
          clicks: 8932,
          conversions: 234,
          revenue: 4532.50,
          ctr: 71.2,
          cr: 2.6
        }
      },
      {
        method: 'GET',
        path: '/api/stats/breakdown',
        description: 'Get detailed breakdown by dimension',
        params: [
          { name: 'dimension', type: 'string', required: true, description: 'campaign, offer, affiliate, country, device' },
          { name: 'start_date', type: 'string', required: false, description: 'Start date (YYYY-MM-DD)' },
          { name: 'end_date', type: 'string', required: false, description: 'End date (YYYY-MM-DD)' },
        ],
        response: {
          data: [
            { name: 'Campaign A', visits: 5234, clicks: 3421, conversions: 123, revenue: 2345.00 },
            { name: 'Campaign B', visits: 3201, clicks: 2103, conversions: 89, revenue: 1890.50 }
          ]
        }
      },
    ]
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    icon: Target,
    endpoints: [
      {
        method: 'GET',
        path: '/api/campaigns',
        description: 'List all campaigns',
        params: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status: active, paused, archived' },
          { name: 'limit', type: 'integer', required: false, description: 'Results per page (default: 25)' },
          { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' },
        ],
        response: {
          data: [
            { id: 1, name: 'Summer Sale', status: 'active', offers_count: 12, visits: 5432 },
            { id: 2, name: 'Black Friday', status: 'paused', offers_count: 8, visits: 3201 }
          ],
          total: 45,
          limit: 25,
          offset: 0
        }
      },
      {
        method: 'POST',
        path: '/api/campaigns',
        description: 'Create new campaign',
        params: [
          { name: 'name', type: 'string', required: true, description: 'Campaign name' },
          { name: 'description', type: 'string', required: false, description: 'Campaign description' },
          { name: 'status', type: 'string', required: false, description: 'active or paused (default: active)' },
        ],
        response: {
          id: 3,
          name: 'New Campaign',
          status: 'active',
          created_at: '2026-06-18T13:25:00Z'
        }
      },
      {
        method: 'PUT',
        path: '/api/campaigns/:id',
        description: 'Update campaign',
        params: [
          { name: 'name', type: 'string', required: false, description: 'Campaign name' },
          { name: 'description', type: 'string', required: false, description: 'Campaign description' },
          { name: 'status', type: 'string', required: false, description: 'active, paused, or archived' },
        ],
        response: {
          id: 3,
          name: 'Updated Campaign',
          status: 'paused',
          updated_at: '2026-06-18T13:25:00Z'
        }
      },
      {
        method: 'DELETE',
        path: '/api/campaigns/:id',
        description: 'Delete campaign',
        params: [],
        response: {
          success: true,
          message: 'Campaign deleted successfully'
        }
      },
    ]
  },
  {
    id: 'offers',
    title: 'Offers',
    icon: Gift,
    endpoints: [
      {
        method: 'GET',
        path: '/api/offers',
        description: 'List all offers',
        params: [
          { name: 'campaign_id', type: 'integer', required: false, description: 'Filter by campaign' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
        ],
        response: {
          data: [
            { id: 1, name: 'Product A', payout: 25.00, status: 'active', campaign_id: 1 },
            { id: 2, name: 'Product B', payout: 35.00, status: 'active', campaign_id: 1 }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/offers/:id',
        description: 'Get offer details',
        params: [],
        response: {
          id: 1,
          name: 'Product A',
          description: 'High-converting offer',
          payout: 25.00,
          status: 'active',
          campaign_id: 1,
          tracking_url: 'https://track.example.com/click/abc123'
        }
      },
    ]
  },
  {
    id: 'affiliates',
    title: 'Affiliates',
    icon: Users,
    endpoints: [
      {
        method: 'GET',
        path: '/api/affiliates',
        description: 'List all affiliates',
        params: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status: active, pending, suspended' },
        ],
        response: {
          data: [
            { id: 1, email: 'affiliate@example.com', status: 'active', total_earnings: 5432.00 },
            { id: 2, email: 'partner@example.com', status: 'active', total_earnings: 3201.50 }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/affiliates/:id/stats',
        description: 'Get affiliate performance statistics',
        params: [
          { name: 'start_date', type: 'string', required: false, description: 'Start date (YYYY-MM-DD)' },
          { name: 'end_date', type: 'string', required: false, description: 'End date (YYYY-MM-DD)' },
        ],
        response: {
          affiliate_id: 1,
          visits: 8932,
          clicks: 5234,
          conversions: 156,
          revenue: 3890.00,
          pending_payout: 450.00
        }
      },
    ]
  },
  {
    id: 'earnings',
    title: 'Earnings',
    icon: DollarSign,
    endpoints: [
      {
        method: 'GET',
        path: '/api/earnings',
        description: 'Retrieve earnings data',
        params: [
          { name: 'start_date', type: 'string', required: false, description: 'Start date (YYYY-MM-DD)' },
          { name: 'end_date', type: 'string', required: false, description: 'End date (YYYY-MM-DD)' },
          { name: 'status', type: 'string', required: false, description: 'pending, approved, paid' },
        ],
        response: {
          total_earnings: 5432.00,
          pending: 890.00,
          approved: 1200.00,
          paid: 3342.00,
          transactions: [
            { id: 1, amount: 25.00, status: 'approved', date: '2026-06-18' }
          ]
        }
      },
    ]
  },
  {
    id: 'commissions',
    title: 'Commissions',
    icon: CreditCard,
    endpoints: [
      {
        method: 'GET',
        path: '/api/commissions',
        description: 'List commission transactions',
        params: [
          { name: 'affiliate_id', type: 'integer', required: false, description: 'Filter by affiliate' },
          { name: 'offer_id', type: 'integer', required: false, description: 'Filter by offer' },
          { name: 'status', type: 'string', required: false, description: 'pending, approved, rejected' },
        ],
        response: {
          data: [
            { id: 1, affiliate_id: 1, offer_id: 5, amount: 25.00, status: 'approved', created_at: '2026-06-18T10:30:00Z' },
            { id: 2, affiliate_id: 1, offer_id: 7, amount: 35.00, status: 'pending', created_at: '2026-06-18T12:15:00Z' }
          ]
        }
      },
      {
        method: 'PUT',
        path: '/api/commissions/:id',
        description: 'Update commission status',
        params: [
          { name: 'status', type: 'string', required: true, description: 'approved or rejected' },
          { name: 'reason', type: 'string', required: false, description: 'Reason for rejection' },
        ],
        response: {
          id: 2,
          status: 'approved',
          updated_at: '2026-06-18T13:25:00Z'
        }
      },
    ]
  },
  {
    id: 'smartlinks',
    title: 'Smartlinks',
    icon: Link2,
    endpoints: [
      {
        method: 'POST',
        path: '/api/smartlinks',
        description: 'Generate smartlink',
        params: [
          { name: 'campaign_id', type: 'integer', required: true, description: 'Campaign ID' },
          { name: 'custom_params', type: 'object', required: false, description: 'Custom tracking parameters' },
        ],
        response: {
          id: 123,
          url: 'https://track.example.com/smart/abc123',
          campaign_id: 1,
          created_at: '2026-06-18T13:25:00Z'
        }
      },
      {
        method: 'GET',
        path: '/api/smartlinks/:id/stats',
        description: 'Get smartlink performance',
        params: [],
        response: {
          smartlink_id: 123,
          visits: 4532,
          clicks: 2341,
          conversions: 89,
          revenue: 2234.00
        }
      },
    ]
  },
  {
    id: 'domains',
    title: 'Domains',
    icon: Globe,
    endpoints: [
      {
        method: 'GET',
        path: '/api/domains',
        description: 'List tracking domains',
        params: [],
        response: {
          data: [
            { id: 1, name: 'track.example.com', ssl_enabled: true, is_default: true },
            { id: 2, name: 'click.example.net', ssl_enabled: true, is_default: false }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/domains',
        description: 'Add tracking domain',
        params: [
          { name: 'name', type: 'string', required: true, description: 'Domain name' },
          { name: 'ssl_enabled', type: 'boolean', required: false, description: 'Enable SSL (default: true)' },
        ],
        response: {
          id: 3,
          name: 'new.example.com',
          ssl_enabled: true,
          created_at: '2026-06-18T13:25:00Z'
        }
      },
    ]
  },
  {
    id: 'shorteners',
    title: 'Shorteners',
    icon: FileCode,
    endpoints: [
      {
        method: 'GET',
        path: '/api/shorteners',
        description: 'List URL shortener integrations',
        params: [],
        response: {
          data: [
            { id: 1, service_id: 'bitly', name: 'My Bitly', status: 'connected' },
            { id: 2, service_id: 'tinyurl', name: 'TinyURL', status: 'connected' }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/shorteners/shorten',
        description: 'Shorten URL',
        params: [
          { name: 'url', type: 'string', required: true, description: 'URL to shorten' },
          { name: 'service_id', type: 'string', required: false, description: 'Shortener service to use' },
        ],
        response: {
          original_url: 'https://example.com/very-long-url',
          short_url: 'https://bit.ly/abc123',
          service: 'bitly'
        }
      },
    ]
  },
  {
    id: 'ai',
    title: 'AI Content',
    icon: Sparkles,
    endpoints: [
      {
        method: 'POST',
        path: '/api/ai/generate',
        description: 'Generate AI content',
        params: [
          { name: 'type', type: 'string', required: true, description: 'banner, copy, headline, cta, email, landing' },
          { name: 'prompt', type: 'string', required: true, description: 'Content generation prompt' },
          { name: 'options', type: 'object', required: false, description: 'Additional generation options' },
        ],
        response: {
          type: 'headline',
          content: 'Unlock 50% Off Your First Purchase Today!',
          suggestions: [
            'Save Big: 50% Off Starts Now!',
            'Limited Time: Half Price on Everything!'
          ]
        }
      },
    ]
  },
];

const METHOD_STYLES = {
  GET: 'bg-green-500/10 text-green-400 border-green-500/20',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function APIDocs() {
  const [activeSection, setActiveSection] = useState('auth');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
          API Documentation
        </h1>
        <p className="text-slate-400">Complete API reference for affiliate tracking platform</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar TOC */}
        <div className="col-span-3">
          <GlassCard className="sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white">Contents</h3>
            </div>
            <nav className="space-y-1">
              {API_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      activeSection === section.id
                        ? 'bg-indigo-primary/20 text-indigo-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-8">
          {/* Authentication Notice */}
          <GlassCard className="border-indigo-primary/30">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Authentication Required</h3>
                <p className="text-sm text-slate-400 mb-3">
                  All API requests require authentication via Bearer token in the Authorization header.
                </p>
                <code className="block px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-slate-300 font-mono">
                  Authorization: Bearer YOUR_API_TOKEN
                </code>
              </div>
            </div>
          </GlassCard>

          {/* API Sections */}
          {API_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} id={`section-${section.id}`}>
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {section.endpoints.map((endpoint, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${METHOD_STYLES[endpoint.method]}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm text-slate-300 font-mono">{endpoint.path}</code>
                        </div>

                        <p className="text-sm text-slate-400">{endpoint.description}</p>

                        {endpoint.params.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-white mb-3">Parameters</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Name</th>
                                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Type</th>
                                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Required</th>
                                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.params.map((param, pidx) => (
                                    <tr key={pidx} className="border-b border-white/5">
                                      <td className="py-2 px-3 font-mono text-indigo-400">{param.name}</td>
                                      <td className="py-2 px-3 text-slate-400">{param.type}</td>
                                      <td className="py-2 px-3">
                                        {param.required ? (
                                          <span className="text-red-400 text-xs font-bold">YES</span>
                                        ) : (
                                          <span className="text-slate-500 text-xs">No</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-slate-400">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-bold text-white mb-3">Example Response</h4>
                          <pre className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-xs text-slate-300 font-mono overflow-x-auto">
                            {JSON.stringify(endpoint.response, null, 2)}
                          </pre>
                        </div>

                        {idx < section.endpoints.length - 1 && (
                          <div className="border-t border-white/5 pt-8" />
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
