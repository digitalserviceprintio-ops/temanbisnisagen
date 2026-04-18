import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppUser, DailyStatus, Transaction, Balance, AdminSettings, Notification, PageId } from '@/types/app';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchTransactions, insertTransaction,
  fetchAdminSettings, upsertAdminSettings,
  fetchDailyStatus, insertDailyStatus, closeDailyStatus, resetUserData,
  fetchStoreProfile, upsertStoreProfile, type StoreProfileData,
} from '@/lib/supabase-data';
import { checkLicense, checkIsAdmin, type LicenseInfo } from '@/lib/license-data';
import { useAdminPaymentNotifications } from '@/hooks/use-admin-payment-notifications';

interface AppContextType {
  authReady: boolean;
  dataLoading: boolean;
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
  storeProfile: StoreProfileData | null;
  updateStoreProfile: (profile: StoreProfileData) => Promise<void>;
  licenseInfo: LicenseInfo | null;
  isAdmin: boolean;
  refreshLicense: () => Promise<void>;
  userEmail: string;
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
  const [storeProfile, setStoreProfile] = useState<StoreProfileData | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
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
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        // Set authReady immediately so UI doesn't hang, then load profile
        setUserEmail(session.user.email || '');
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Agen',
          phone: session.user.user_metadata?.phone || '',
          role: 'Agen',
          pin: '',
        });
        setAuthReady(true);

        // Load profile in background to update name/phone
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (mounted && profile) {
            setUser(prev => prev ? {
              ...prev,
              name: profile.name || prev.name,
              phone: profile.phone || prev.phone,
              role: profile.role || prev.role,
            } : prev);
          }
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
      } else {
        setUser(null);
        setAuthReady(true);
      }
    });

    // Fallback: if auth listener doesn't fire within 3s, mark ready
    const timeout = setTimeout(() => {
      if (mounted) setAuthReady(true);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Realtime admin payment notifications
  useAdminPaymentNotifications(isAdmin, user?.id);

  // Listen for navigation events from notifications
  useEffect(() => {
    const handler = () => setCurrentPage('payment-management');
    window.addEventListener('navigate-to-payment-management', handler);
    return () => window.removeEventListener('navigate-to-payment-management', handler);
  }, []);

  const refreshLicense = useCallback(async () => {
    if (!user) return;
    const info = await checkLicense(user.id);
    setLicenseInfo(info);
    const admin = await checkIsAdmin(user.id);
    setIsAdmin(admin);
  }, [user]);

  const [dataLoading, setDataLoading] = useState(false);

  // Load cloud data when user logs in
  useEffect(() => {
    if (!user) { setDataLoading(false); return; }
    let cancelled = false;
    setDataLoading(true);

    // Hard safety timeout: never block UI more than 8 seconds
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Data load safety timeout — releasing UI');
        setDataLoading(false);
      }
    }, 8000);

    const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
      p.catch((e) => { console.warn('fetch failed:', e); return fallback; });

    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const [info, admin, settings, sp, status] = await Promise.all([
          safe(checkLicense(user.id), { valid: false } as any),
          safe(checkIsAdmin(user.id), false),
          safe(fetchAdminSettings(user.id), null),
          safe(fetchStoreProfile(user.id), null),
          safe(fetchDailyStatus(user.id, today), null),
        ]);

        if (cancelled) return;

        setLicenseInfo(info);
        setIsAdmin(admin);
        if (settings) setAdminSettings(settings);
        if (sp) setStoreProfile(sp);

        if (status) {
          setDailyStatus(status);
          const txs = await safe(fetchTransactions(user.id, today), []);
          if (cancelled) return;
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
      } catch (err) {
        console.error('loadData error:', err);
        if (!cancelled) setCurrentPage('open-store');
      } finally {
        clearTimeout(safetyTimer);
        if (!cancelled) setDataLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; clearTimeout(safetyTimer); };
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
    setStoreProfile(null);
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

  const updateStoreProfile = useCallback(async (profile: StoreProfileData) => {
    if (!user) return;
    await upsertStoreProfile(user.id, profile);
    setStoreProfile(profile);
    addNotification('Profil toko berhasil disimpan!');
  }, [user, addNotification]);


  return (
    <AppContext.Provider value={{
      user, authReady, dataLoading, currentPage, setCurrentPage, dailyStatus, transactions, balance,
      notifications, adminSettings, showTransactionModal, setShowTransactionModal,
      showTopupModal, setShowTopupModal, showReceipt, setShowReceipt,
      showCloseShift, setShowCloseShift,
      handleOpenStore, handleTopup, handleTransaction,
      handleCloseShift, handleLogout, updateAdminSettings, handleResetData,
      searchQuery, setSearchQuery, storeProfile, updateStoreProfile,
      licenseInfo, isAdmin, refreshLicense, userEmail,
    }}>
      {children}
    </AppContext.Provider>
  );
};
