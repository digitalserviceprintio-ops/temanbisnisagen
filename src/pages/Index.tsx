import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import AuthPage from '@/components/AuthPage';
import LicenseActivationPage from '@/components/LicenseActivationPage';
import OpenStorePage from '@/components/OpenStorePage';
import DashboardPage from '@/components/DashboardPage';
import BottomNav from '@/components/BottomNav';
import TransactionModal from '@/components/TransactionModal';
import TopupModal from '@/components/TopupModal';
import ReceiptModal from '@/components/ReceiptModal';
import CloseShiftModal from '@/components/CloseShiftModal';
import NotificationToast from '@/components/NotificationToast';
import OfflineIndicator from '@/components/OfflineIndicator';
import { Loader2 } from 'lucide-react';

// Lazy load less-used pages
const CashbookPage = lazy(() => import('@/components/CashbookPage'));
const ReportPage = lazy(() => import('@/components/ReportPage'));
const AccountPage = lazy(() => import('@/components/AccountPage'));
const AdminSettingsPage = lazy(() => import('@/components/AdminSettingsPage'));
const FaqPage = lazy(() => import('@/components/FaqPage'));
const MonthlyReportPage = lazy(() => import('@/components/MonthlyReportPage'));
const LicenseManagementPage = lazy(() => import('@/components/LicenseManagementPage'));
const PricingPage = lazy(() => import('@/components/PricingPage'));
const PaymentPage = lazy(() => import('@/components/PaymentPage'));
const PaymentManagementPage = lazy(() => import('@/components/PaymentManagementPage'));
const PaymentHistoryPage = lazy(() => import('@/components/PaymentHistoryPage'));

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  const { user, authReady, dataLoading, currentPage, licenseInfo, isAdmin, refreshLicense, handleLogout, userEmail } = useApp();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <AuthPage onAuthSuccess={() => {}} />;

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Memuat data...</p>
      </div>
    );
  }

  if (!isAdmin && (!licenseInfo || !licenseInfo.valid)) {
    return (
      <LicenseActivationPage
        userId={user.id}
        userEmail={userEmail}
        licenseInfo={licenseInfo}
        onActivated={refreshLicense}
        onLogout={handleLogout}
      />
    );
  }

  const hiddenNavPages: string[] = ['open-store', 'admin-settings', 'faq', 'monthly-report', 'license-management', 'pricing', 'payment', 'payment-management', 'payment-history'];

  const renderPage = () => {
    switch (currentPage) {
      case 'open-store': return <OpenStorePage />;
      case 'dashboard': return <DashboardPage />;
      case 'cashbook': return <Suspense fallback={<PageFallback />}><CashbookPage /></Suspense>;
      case 'report': return <Suspense fallback={<PageFallback />}><ReportPage /></Suspense>;
      case 'monthly-report': return <Suspense fallback={<PageFallback />}><MonthlyReportPage /></Suspense>;
      case 'account': return <Suspense fallback={<PageFallback />}><AccountPage /></Suspense>;
      case 'admin-settings': return <Suspense fallback={<PageFallback />}><AdminSettingsPage /></Suspense>;
      case 'faq': return <Suspense fallback={<PageFallback />}><FaqPage /></Suspense>;
      case 'license-management': return <Suspense fallback={<PageFallback />}><LicenseManagementPage /></Suspense>;
      case 'pricing': return <Suspense fallback={<PageFallback />}><PricingPage /></Suspense>;
      case 'payment': return <Suspense fallback={<PageFallback />}><PaymentPage /></Suspense>;
      case 'payment-management': return <Suspense fallback={<PageFallback />}><PaymentManagementPage /></Suspense>;
      case 'payment-history': return <Suspense fallback={<PageFallback />}><PaymentHistoryPage /></Suspense>;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {renderPage()}
      {!hiddenNavPages.includes(currentPage) && <BottomNav />}
      <TransactionModal />
      <TopupModal />
      <ReceiptModal />
      <CloseShiftModal />
      <NotificationToast />
      <OfflineIndicator />
    </div>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
