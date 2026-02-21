import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppUser, DailyStatus, Transaction, Balance, AdminSettings, Notification, PageId } from '@/types/app';

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
  handleLogin: (phone: string, pin: string) => void;
  handleRegister: (data: { name: string; phone: string; pin: string }) => void;
  handleOpenStore: (cashStart: number, bankStart: number) => void;
  handleTopup: (data: { type: string; amount: number; source: string }) => void;
  handleTransaction: (type: string, amount: number, fee: number, data: { customerName: string; target: string }) => void;
  handleLogout: () => void;
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
  const [adminSettings] = useState<AdminSettings>({
    tarik: { fee: 5000, step: 1000000 },
    setor: { fee: 5000, step: 1000000 },
    transfer: { fee: 6500, step: 1000000 },
  });
  const [showTransactionModal, setShowTransactionModal] = useState<string | null>(null);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);

  const addNotification = useCallback((msg: string) => {
    const id = Date.now();
    setNotifications(prev => [{ id, message: msg }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

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
    setCurrentPage('dashboard');
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
  }, [addNotification]);

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
  }, [addNotification]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage('login');
  }, []);

  return (
    <AppContext.Provider value={{
      user, currentPage, setCurrentPage, registeredUsers, dailyStatus, transactions, balance,
      notifications, adminSettings, showTransactionModal, setShowTransactionModal,
      showTopupModal, setShowTopupModal, showReceipt, setShowReceipt,
      handleLogin, handleRegister, handleOpenStore, handleTopup, handleTransaction,
      handleLogout, searchQuery, setSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  );
};
