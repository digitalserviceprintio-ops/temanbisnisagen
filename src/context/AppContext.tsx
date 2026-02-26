import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppUser, DailyStatus, Transaction, Balance, AdminSettings, Notification, PageId } from '@/types/app';
import {
  fetchTransactions, insertTransaction,
  fetchAdminSettings, upsertAdminSettings,
  fetchDailyStatus, insertDailyStatus, closeDailyStatus,
} from '@/lib/supabase-data';

interface AppContextType {
  user: AppUser | null;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  registeredUsers: AppUser[];
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
  handleLogin: (phone: string, pin: string) => void;
  handleRegister: (data: { name: string; phone: string; pin: string }) => void;
  handleOpenStore: (cashStart: number, bankStart: number) => void;
  handleTopup: (data: { type: string; amount: number; source: string }) => void;
  handleTransaction: (type: string, amount: number, fee: number, data: { customerName: string; target: string }) => void;
  handleCloseShift: () => void;
  handleLogout: () => void;
  updateAdminSettings: (settings: AdminSettings) => void;
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
  const [currentPage, setCurrentPage] = useState<PageId>('login');
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([
    { id: 'USR-8821', name: 'Agen Budi', phone: '08123456789', role: 'Agen', pin: '123456' },
  ]);
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

  const addNotification = useCallback((msg: string) => {
    const id = Date.now();
    setNotifications(prev => [{ id, message: msg }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Load cloud data when user logs in
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      // Load admin settings
      const settings = await fetchAdminSettings(user.id);
      if (settings) setAdminSettings(settings);

      // Load today's shift
      const today = new Date().toISOString().split('T')[0];
      const status = await fetchDailyStatus(user.id, today);
      if (status) {
        setDailyStatus(status);
        // Load transactions for this shift
        const txs = await fetchTransactions(user.id, today);
        setTransactions(txs);
        // Recalculate balance
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
      }
    };
    loadData();
  }, [user]);

  const handleLogin = useCallback((phone: string, pin: string) => {
    const foundUser = registeredUsers.find(u => u.phone === phone && u.pin === pin);
    if (foundUser) {
      setUser(foundUser);
      addNotification(`Selamat datang, ${foundUser.name}`);
      const today = new Date().toISOString().split('T')[0];
      if (!dailyStatus || dailyStatus.date !== today) {
        setCurrentPage('open-store');
      } else {
        setCurrentPage('dashboard');
      }
    } else {
      addNotification('Nomor HP atau PIN salah!');
    }
  }, [registeredUsers, dailyStatus, addNotification]);

  const handleRegister = useCallback((data: { name: string; phone: string; pin: string }) => {
    if (registeredUsers.some(u => u.phone === data.phone)) {
      addNotification('Nomor HP sudah terdaftar!');
      return;
    }
    if (data.pin.length !== 6) {
      addNotification('PIN harus 6 digit!');
      return;
    }
    const newUser: AppUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      phone: data.phone,
      role: 'Agen',
      pin: data.pin,
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    addNotification('Pendaftaran Berhasil! Silakan Login.');
  }, [registeredUsers, addNotification]);

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
    // Persist to cloud
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
    // Persist
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
    // Persist
    const shiftDate = dailyStatus?.date || new Date().toISOString().split('T')[0];
    insertTransaction(newTx, user?.id || '', shiftDate);
  }, [addNotification, dailyStatus, user]);

  const handleCloseShift = useCallback(() => {
    if (dailyStatus) {
      setDailyStatus({
        ...dailyStatus,
        status: 'CLOSED',
        timeClosed: new Date().toISOString(),
      });
      closeDailyStatus(dailyStatus.id);
    }
    setShowCloseShift(false);
    addNotification('Shift berhasil ditutup!');
    setCurrentPage('open-store');
  }, [dailyStatus, addNotification]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage('login');
  }, []);

  const updateAdminSettings = useCallback((settings: AdminSettings) => {
    setAdminSettings(settings);
    addNotification('Pengaturan biaya admin berhasil disimpan!');
    setCurrentPage('account');
    // Persist
    if (user) upsertAdminSettings(user.id, settings);
  }, [addNotification, user]);

  return (
    <AppContext.Provider value={{
      user, currentPage, setCurrentPage, registeredUsers, dailyStatus, transactions, balance,
      notifications, adminSettings, showTransactionModal, setShowTransactionModal,
      showTopupModal, setShowTopupModal, showReceipt, setShowReceipt,
      showCloseShift, setShowCloseShift,
      handleLogin, handleRegister, handleOpenStore, handleTopup, handleTransaction,
      handleCloseShift, handleLogout, updateAdminSettings, searchQuery, setSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  );
};
