import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppUser, DailyStatus, Transaction, Balance, AdminSettings, Notification, PageId } from '@/types/app';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchTransactions, insertTransaction,
  fetchAdminSettings, upsertAdminSettings,
  fetchDailyStatus, insertDailyStatus, closeDailyStatus, resetUserData,
} from '@/lib/supabase-data';

interface AppContextType {
  user: AppUser | null;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  dailyStatus: DailyStatus | null;
  transactions: Transaction[];
  balance: Balance;
  notifications: Notification[];
  adminSettings: AdminSettings;
  showTransactionModal: string | null;
  setShowTransactionModal: (type: string | null) => void;
  showTopupModal: boolean;
  setShowTopupModal: (show: boolean) => void;
  showReceipt: Transaction | null;
  setShowReceipt: (tx: Transaction | null) => void;
  showCloseShift: boolean;
  setShowCloseShift: (show: boolean) => void;
  handleOpenStore: (cashStart: number, bankStart: number) => void;
  handleTopup: (data: { type: string; amount: number; source: string }) => void;
  handleTransaction: (type: string, amount: number, fee: number, data: { customerName: string; target: string }) => void;
  handleCloseShift: () => void;
  handleLogout: () => void;
  updateAdminSettings: (settings: AdminSettings) => void;
  handleResetData: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({ cash: 0, bank: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    tarik: { fee: 5000, step: 1000000 },
    setor: { fee: 5000, step: 1000000 },
    transfer: { fee: 6500, step: 1000000 },
  });
  const [showTransactionModal, setShowTransactionModal] = useState<string | null>(null);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const addNotification = useCallback((msg: string) => {
    const id = Date.now();
    setNotifications(prev => [{ id, message: msg }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  }, []);

  // Listen to auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.name || 'Agen',
          phone: profile?.phone || session.user.user_metadata?.phone || '',
          role: profile?.role || 'Agen',
          pin: '',
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    supabase.auth.getSession();

    return () => subscription.unsubscribe();
  }, []);

  // Load cloud data when user logs in
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const settings = await fetchAdminSettings(user.id);
      if (settings) setAdminSettings(settings);

      const today = new Date().toISOString().split('T')[0];
      const status = await fetchDailyStatus(user.id, today);
      if (status) {
        setDailyStatus(status);
        const txs = await fetchTransactions(user.id, today);
        setTransactions(txs);
        let cash = status.cashStart;
        let bank = status.bankStart;
        for (const tx of txs) {
          if (tx.type === 'TOPUP') {
            if (tx.target === 'KAS LACI') cash += tx.amount;
            else bank += tx.amount;
          } else if (tx.type === 'TARIK') {
            cash -= tx.amount;
            bank += tx.amount + tx.fee;
          } else {
            cash += tx.amount + tx.fee;
            bank -= tx.amount;
          }
        }
        setBalance({ cash, bank });
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('open-store');
      }
    };
    loadData();
  }, [user]);

  const handleOpenStore = useCallback((cashStart: number, bankStart: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newStatus: DailyStatus = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user?.id || '',
      date: today,
      cashStart,
      bankStart,
      timeOpen: new Date().toISOString(),
      status: 'OPEN',
    };
    setDailyStatus(newStatus);
    setBalance({ cash: cashStart, bank: bankStart });
    setTransactions([]);
    setCurrentPage('dashboard');
    insertDailyStatus(newStatus);
  }, [user]);

  const handleTopup = useCallback((data: { type: string; amount: number; source: string }) => {
    const { type, amount, source } = data;
    if (type === 'CASH') {
      setBalance(prev => ({ ...prev, cash: prev.cash + amount }));
    } else {
      setBalance(prev => ({ ...prev, bank: prev.bank + amount }));
    }
    const entry: Transaction = {
      id: `TX-TP-${Date.now()}`,
      type: 'TOPUP',
      amount,
      fee: 0,
      timestamp: new Date().toISOString(),
      customerName: `MODAL: ${source.toUpperCase()}`,
      target: type === 'CASH' ? 'KAS LACI' : 'REKENING',
      status: 'SUCCESS',
    };
    setTransactions(prev => [entry, ...prev]);
    addNotification(`Top Up ${type} Berhasil!`);
    setShowTopupModal(false);
    const shiftDate = dailyStatus?.date || new Date().toISOString().split('T')[0];
    insertTransaction(entry, user?.id || '', shiftDate);
  }, [addNotification, dailyStatus, user]);

  const handleTransaction = useCallback((type: string, amount: number, fee: number, data: { customerName: string; target: string }) => {
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      type: type as Transaction['type'],
      amount,
      fee,
      timestamp: new Date().toISOString(),
      customerName: data.customerName || 'Customer Umum',
      target: data.target || '-',
      status: 'SUCCESS',
    };
    setTransactions(prev => [newTx, ...prev]);
    if (type === 'TARIK') {
      setBalance(prev => ({ cash: prev.cash - amount, bank: prev.bank + amount + fee }));
    } else {
      setBalance(prev => ({ cash: prev.cash + amount + fee, bank: prev.bank - amount }));
    }
    addNotification(`Transaksi ${type} Berhasil!`);
    setShowTransactionModal(null);
    setShowReceipt(newTx);
    const shiftDate = dailyStatus?.date || new Date().toISOString().split('T')[0];
    insertTransaction(newTx, user?.id || '', shiftDate);
  }, [addNotification, dailyStatus, user]);

  const handleCloseShift = useCallback(() => {
    if (dailyStatus) {
      setDailyStatus({ ...dailyStatus, status: 'CLOSED', timeClosed: new Date().toISOString() });
      closeDailyStatus(dailyStatus.id);
    }
    setShowCloseShift(false);
    addNotification('Shift berhasil ditutup!');
    setCurrentPage('open-store');
  }, [dailyStatus, addNotification]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDailyStatus(null);
    setTransactions([]);
    setBalance({ cash: 0, bank: 0 });
  }, []);

  const updateAdminSettings = useCallback((settings: AdminSettings) => {
    setAdminSettings(settings);
    addNotification('Pengaturan biaya admin berhasil disimpan!');
    setCurrentPage('account');
    if (user) upsertAdminSettings(user.id, settings);
  }, [addNotification, user]);

  const handleResetData = useCallback(async () => {
    if (!user) return;
    await resetUserData(user.id);
    setTransactions([]);
    setDailyStatus(null);
    setBalance({ cash: 0, bank: 0 });
    setAdminSettings({ tarik: { fee: 5000, step: 1000000 }, setor: { fee: 5000, step: 1000000 }, transfer: { fee: 6500, step: 1000000 } });
    addNotification('Semua data berhasil direset!');
    setCurrentPage('open-store');
  }, [user, addNotification]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user, currentPage, setCurrentPage, dailyStatus, transactions, balance,
      notifications, adminSettings, showTransactionModal, setShowTransactionModal,
      showTopupModal, setShowTopupModal, showReceipt, setShowReceipt,
      showCloseShift, setShowCloseShift,
      handleOpenStore, handleTopup, handleTransaction,
      handleCloseShift, handleLogout, updateAdminSettings, handleResetData, searchQuery, setSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  );
};
