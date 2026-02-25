export interface AppUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  pin: string;
}

export interface DailyStatus {
  id: string;
  user_id: string;
  date: string;
  cashStart: number;
  bankStart: number;
  timeOpen: string;
  timeClosed?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface Transaction {
  id: string;
  type: 'TARIK' | 'SETOR' | 'TRANSFER' | 'TOPUP';
  amount: number;
  fee: number;
  timestamp: string;
  customerName: string;
  target: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface Balance {
  cash: number;
  bank: number;
}

export interface AdminSettings {
  tarik: { fee: number; step: number };
  setor: { fee: number; step: number };
  transfer: { fee: number; step: number };
}

export interface ShiftSummary {
  totalTransactions: number;
  totalAdminFee: number;
  totalVolume: number;
  cashStart: number;
  cashEnd: number;
  cashDifference: number;
  bankStart: number;
  bankEnd: number;
  bankDifference: number;
  tarikCount: number;
  setorCount: number;
  transferCount: number;
  topupCount: number;
}

export interface Notification {
  id: number;
  message: string;
}

export type PageId = 'login' | 'open-store' | 'dashboard' | 'cashbook' | 'report' | 'account' | 'admin-settings';
export type TransactionType = 'TARIK' | 'SETOR' | 'TRANSFER';
