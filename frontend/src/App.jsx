import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Shell } from './layout/Shell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { Offers } from './pages/Offers';
import { Affiliates } from './pages/Affiliates';
import { SmartlinkGenerator } from './pages/SmartlinkGenerator';
import { AITools } from './pages/AITools';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { VIPPerks } from './pages/VIPPerks';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Advertisers } from './pages/Advertisers';
const TrafficSources = lazy(() => import('./pages/TrafficSources.jsx').then(m => ({ default: m.TrafficSources })).catch(() => fallback));
const LaporanIklan = lazy(() => import('./pages/LaporanIklan.jsx').then(m => ({ default: m.LaporanIklan })).catch(() => fallback));
const AnalyticHarian = lazy(() => import('./pages/AnalyticHarian.jsx').then(m => ({ default: m.AnalyticHarian })).catch(() => fallback));
const LaporanTaglink = lazy(() => import('./pages/LaporanTaglink.jsx').then(m => ({ default: m.LaporanTaglink })).catch(() => fallback));
import { ManualConversion } from './pages/ManualConversion';

// Lazy-loaded pages (created by subagents or still pending)
const fallback = { default: () => <div className="text-white p-8">Loading...</div> };
const Earnings = lazy(() => import('./pages/Earnings.jsx').then(m => ({ default: m.Earnings })).catch(() => fallback));
const Commissions = lazy(() => import('./pages/Commissions.jsx').then(m => ({ default: m.Commissions })).catch(() => fallback));
const Domains = lazy(() => import('./pages/Domains.jsx').then(m => ({ default: m.Domains })).catch(() => fallback));
const Shorteners = lazy(() => import('./pages/Shorteners.jsx').then(m => ({ default: m.Shorteners })).catch(() => fallback));
const ClickServers = lazy(() => import('./pages/ClickServers.jsx').then(m => ({ default: m.ClickServers })).catch(() => fallback));
const LandingPageBuilder = lazy(() => import('./pages/LandingPageBuilder.jsx').then(m => ({ default: m.LandingPageBuilder })).catch(() => fallback));
const DeepLinkGenerator = lazy(() => import('./pages/DeepLinkGenerator.jsx').then(m => ({ default: m.DeepLinkGenerator })).catch(() => fallback));
const PostbackBuilder = lazy(() => import('./pages/PostbackBuilder.jsx').then(m => ({ default: m.PostbackBuilder })).catch(() => fallback));
const Attribution = lazy(() => import('./pages/Attribution.jsx').then(m => ({ default: m.Attribution })).catch(() => fallback));
const Reports = lazy(() => import('./pages/Reports.jsx').then(m => ({ default: m.Reports })).catch(() => fallback));
const ClickTracker = lazy(() => import('./pages/ClickTracker.jsx').then(m => ({ default: m.ClickTracker })).catch(() => fallback));
const DayParting = lazy(() => import('./pages/DayParting.jsx').then(m => ({ default: m.DayParting })).catch(() => fallback));
const Integrations = lazy(() => import('./pages/Integrations.jsx'));
const ImportExport = lazy(() => import('./pages/ImportExport.jsx').then(m => ({ default: m.ImportExport })).catch(() => fallback));
const Pipeline = lazy(() => import('./pages/Pipeline.jsx').then(m => ({ default: m.Pipeline })).catch(() => fallback));
const Poster = lazy(() => import('./pages/Poster.jsx').then(m => ({ default: m.Poster })).catch(() => fallback));
const APIDocs = lazy(() => import('./pages/APIDocs.jsx').then(m => ({ default: m.APIDocs })).catch(() => fallback));
const AffiliateDashboard = lazy(() => import('./pages/AffiliateDashboard.jsx').then(m => ({ default: m.AffiliateDashboard })).catch(() => fallback));
const AffiliatePortal = lazy(() => import('./pages/AffiliatePortal.jsx').then(m => ({ default: m.AffiliatePortal })).catch(() => fallback));
const ConversionLog = lazy(() => import('./pages/ConversionLog.jsx').then(m => ({ default: m.ConversionLog })).catch(() => fallback));
const Automation = lazy(() => import('./pages/Automation.jsx').then(m => ({ default: m.Automation })).catch(() => fallback));
const LaporanOrder = lazy(() => import('./pages/LaporanOrder.jsx').then(m => ({ default: m.LaporanOrder })).catch(() => fallback));
const LaporanPembayaran = lazy(() => import('./pages/LaporanPembayaran.jsx').then(m => ({ default: m.LaporanPembayaran })).catch(() => fallback));
const SaldoBudget = lazy(() => import('./pages/SaldoBudget.jsx').then(m => ({ default: m.SaldoBudget })).catch(() => fallback));
const TrafficRules = lazy(() => import('./pages/TrafficRules.jsx').then(m => ({ default: m.TrafficRules })).catch(() => fallback));
const CampaignCompare = lazy(() => import('./pages/CampaignCompare.jsx').then(m => ({ default: m.CampaignCompare })).catch(() => fallback));
const Webhooks = lazy(() => import('./pages/Webhooks.jsx').then(m => ({ default: m.Webhooks })).catch(() => fallback));
const ReportBuilder = lazy(() => import('./pages/ReportBuilder.jsx').then(m => ({ default: m.ReportBuilder })).catch(() => fallback));
const ConversionStatuses = lazy(() => import('./pages/ConversionStatuses.jsx').then(m => ({ default: m.ConversionStatuses })).catch(() => fallback));
const AttributionView = lazy(() => import('./pages/AttributionView.jsx').then(m => ({ default: m.AttributionView })).catch(() => fallback));
const WhiteLabel = lazy(() => import('./pages/WhiteLabel.jsx').then(m => ({ default: m.WhiteLabel })).catch(() => fallback));
const ApiKeys = lazy(() => import('./pages/ApiKeys.jsx').then(m => ({ default: m.ApiKeys })).catch(() => fallback));
const ABTests = lazy(() => import('./pages/ABTests.jsx').then(m => ({ default: m.ABTests })).catch(() => fallback));
const ScheduledExports = lazy(() => import('./pages/ScheduledExports.jsx').then(m => ({ default: m.ScheduledExports })).catch(() => fallback));
const RealtimeDashboard = lazy(() => import('./pages/RealtimeDashboard.jsx').then(m => ({ default: m.RealtimeDashboard })).catch(() => fallback));
const TemplateManager = lazy(() => import('./pages/TemplateManager.jsx').then(m => ({ default: m.TemplateManager })).catch(() => fallback));
const Migration = lazy(() => import('./pages/Migration.jsx').then(m => ({ default: m.Migration })).catch(() => fallback));
function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <BrowserRouter>
      <Shell>
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-white p-8">Loading...</div></div>}>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/smartlinks" element={<SmartlinkGenerator />} />
            <Route path="/landing-pages" element={<LandingPageBuilder />} />
            <Route path="/deep-links" element={<DeepLinkGenerator />} />
            <Route path="/postback-builder" element={<PostbackBuilder />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/attribution" element={<Attribution />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/click-tracker" element={<ClickTracker />} />
            <Route path="/day-parting" element={<DayParting />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/shorteners" element={<Shorteners />} />
            <Route path="/click-servers" element={<ClickServers />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/poster" element={<Poster />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/api-docs" element={<APIDocs />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/vip" element={<VIPPerks />} />
            <Route path="/traffic-sources" element={<TrafficSources />} />
            <Route path="/laporan-iklan" element={<LaporanIklan />} />
            <Route path="/analytic-harian" element={<AnalyticHarian />} />
            <Route path="/laporan-taglink" element={<LaporanTaglink />} />
            <Route path="/help" element={<Help />} />
            <Route path="/advertisers" element={<Advertisers />} />
            <Route path="/conversions/manual" element={<ManualConversion />} />
            <Route path="/campaign-compare" element={<CampaignCompare />} />
            <Route path="/webhooks" element={<Webhooks />} />
            <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />
            <Route path="/affiliate-portal" element={<AffiliatePortal />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/laporan-order" element={<LaporanOrder />} />
            <Route path="/laporan-pembayaran" element={<LaporanPembayaran />} />
            <Route path="/saldo-budget" element={<SaldoBudget />} />
            <Route path="/traffic-rules" element={<TrafficRules />} />
            <Route path="/conversion-log" element={<ConversionLog />} />
            <Route path="/report-builder" element={<ReportBuilder />} />
            <Route path="/conversion-statuses" element={<ConversionStatuses />} />
            <Route path="/attribution-view" element={<AttributionView />} />
            <Route path="/white-label" element={<WhiteLabel />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/realtime" element={<RealtimeDashboard />} />
            <Route path="/ab-tests" element={<ABTests />} />
            <Route path="/template-manager" element={<TemplateManager />} />
            <Route path="/migration" element={<Migration />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
          </ErrorBoundary>
        </Suspense>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
