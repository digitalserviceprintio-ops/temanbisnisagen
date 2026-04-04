import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import AuthPage from '@/components/AuthPage';
import LicenseActivationPage from '@/components/LicenseActivationPage';
import OpenStorePage from '@/components/OpenStorePage';
import DashboardPage from '@/components/DashboardPage';
import CashbookPage from '@/components/CashbookPage';
import ReportPage from '@/components/ReportPage';
import AccountPage from '@/components/AccountPage';
import AdminSettingsPage from '@/components/AdminSettingsPage';
import FaqPage from '@/components/FaqPage';
import MonthlyReportPage from '@/components/MonthlyReportPage';
import LicenseManagementPage from '@/components/LicenseManagementPage';
import PricingPage from '@/components/PricingPage';
import PaymentPage from '@/components/PaymentPage';
import PaymentManagementPage from '@/components/PaymentManagementPage';
import PaymentHistoryPage from '@/components/PaymentHistoryPage';
import BottomNav from '@/components/BottomNav';
import TransactionModal from '@/components/TransactionModal';
import TopupModal from '@/components/TopupModal';
import ReceiptModal from '@/components/ReceiptModal';
import CloseShiftModal from '@/components/CloseShiftModal';
import NotificationToast from '@/components/NotificationToast';
import OfflineIndicator from '@/components/OfflineIndicator';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { user, dataLoading, currentPage, licenseInfo, isAdmin, refreshLicense, handleLogout, userEmail } = useApp();

  if (!user) return <AuthPage onAuthSuccess={() => {}} />;

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Memuat data...</p>
      </div>
    );
  }

  if (!user) return <AuthPage onAuthSuccess={() => {}} />;

  // License check: admins bypass, others need valid license
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

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {currentPage === 'open-store' && <OpenStorePage />}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'cashbook' && <CashbookPage />}
      {currentPage === 'report' && <ReportPage />}
      {currentPage === 'monthly-report' && <MonthlyReportPage />}
      {currentPage === 'account' && <AccountPage />}
      {currentPage === 'admin-settings' && <AdminSettingsPage />}
      {currentPage === 'faq' && <FaqPage />}
      {currentPage === 'license-management' && <LicenseManagementPage />}
      {currentPage === 'pricing' && <PricingPage />}
      {currentPage === 'payment' && <PaymentPage />}
      {currentPage === 'payment-management' && <PaymentManagementPage />}
      {currentPage === 'payment-history' && <PaymentHistoryPage />}

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
