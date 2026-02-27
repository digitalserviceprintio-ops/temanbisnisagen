import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import AuthPage from '@/components/AuthPage';
import OpenStorePage from '@/components/OpenStorePage';
import DashboardPage from '@/components/DashboardPage';
import CashbookPage from '@/components/CashbookPage';
import ReportPage from '@/components/ReportPage';
import AccountPage from '@/components/AccountPage';
import AdminSettingsPage from '@/components/AdminSettingsPage';
import FaqPage from '@/components/FaqPage';
import BottomNav from '@/components/BottomNav';
import TransactionModal from '@/components/TransactionModal';
import TopupModal from '@/components/TopupModal';
import ReceiptModal from '@/components/ReceiptModal';
import CloseShiftModal from '@/components/CloseShiftModal';
import NotificationToast from '@/components/NotificationToast';

const AppContent = () => {
  const { user, currentPage } = useApp();

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {currentPage === 'open-store' && <OpenStorePage />}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'cashbook' && <CashbookPage />}
      {currentPage === 'report' && <ReportPage />}
      {currentPage === 'account' && <AccountPage />}
      {currentPage === 'admin-settings' && <AdminSettingsPage />}
      {currentPage === 'faq' && <FaqPage />}

      {currentPage !== 'open-store' && currentPage !== 'admin-settings' && currentPage !== 'faq' && <BottomNav />}

      <TransactionModal />
      <TopupModal />
      <ReceiptModal />
      <CloseShiftModal />
      <NotificationToast />
    </div>
  );
};

// Force full page component remount
const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
