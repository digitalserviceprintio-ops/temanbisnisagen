import { supabase } from '@/integrations/supabase/client';
import type { Transaction, AdminSettings, DailyStatus } from '@/types/app';

// --- Transactions ---
export const fetchTransactions = async (userId: string, date: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('shift_date', date)
    .order('timestamp', { ascending: false });
  if (error) { console.error('fetchTransactions error:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    fee: Number(row.fee),
    timestamp: row.timestamp,
    customerName: row.customer_name,
    target: row.target,
    status: row.status as Transaction['status'],
  }));
};

export const insertTransaction = async (tx: Transaction, userId: string, shiftDate: string) => {
  const { error } = await supabase.from('transactions').insert({
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    fee: tx.fee,
    timestamp: tx.timestamp,
    customer_name: tx.customerName,
    target: tx.target,
    status: tx.status,
    shift_date: shiftDate,
  });
  if (error) console.error('insertTransaction error:', error);
};

// --- Admin Settings ---
export const fetchAdminSettings = async (userId: string): Promise<AdminSettings | null> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.error('fetchAdminSettings error:', error); return null; }
  if (!data) return null;
  return {
    tarik: { fee: Number(data.tarik_fee), step: Number(data.tarik_step) },
    setor: { fee: Number(data.setor_fee), step: Number(data.setor_step) },
    transfer: { fee: Number(data.transfer_fee), step: Number(data.transfer_step) },
  };
};

export const upsertAdminSettings = async (userId: string, settings: AdminSettings) => {
  const { error } = await supabase.from('admin_settings').upsert({
    user_id: userId,
    tarik_fee: settings.tarik.fee,
    tarik_step: settings.tarik.step,
    setor_fee: settings.setor.fee,
    setor_step: settings.setor.step,
    transfer_fee: settings.transfer.fee,
    transfer_step: settings.transfer.step,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('upsertAdminSettings error:', error);
};

// --- Daily Status ---
export const fetchDailyStatus = async (userId: string, date: string): Promise<DailyStatus | null> => {
  const { data, error } = await supabase
    .from('daily_status')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchDailyStatus error:', error); return null; }
  if (!data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    date: data.date,
    cashStart: Number(data.cash_start),
    bankStart: Number(data.bank_start),
    timeOpen: data.time_open,
    timeClosed: data.time_closed || undefined,
    status: data.status as DailyStatus['status'],
  };
};

export const insertDailyStatus = async (ds: DailyStatus) => {
  const { error } = await supabase.from('daily_status').insert({
    id: ds.id,
    user_id: ds.user_id,
    date: ds.date,
    cash_start: ds.cashStart,
    bank_start: ds.bankStart,
    time_open: ds.timeOpen,
    status: ds.status,
  });
  if (error) console.error('insertDailyStatus error:', error);
};

export const closeDailyStatus = async (id: string) => {
  const { error } = await supabase.from('daily_status').update({
    status: 'CLOSED',
    time_closed: new Date().toISOString(),
  }).eq('id', id);
  if (error) console.error('closeDailyStatus error:', error);
};

// --- Store Profile ---
export interface StoreProfileData {
  store_name: string;
  owner_name: string;
  address: string;
  phone: string;
}

export const fetchStoreProfile = async (userId: string): Promise<StoreProfileData | null> => {
  const { data, error } = await supabase
    .from('store_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.error('fetchStoreProfile error:', error); return null; }
  if (!data) return null;
  return {
    store_name: data.store_name,
    owner_name: data.owner_name,
    address: data.address,
    phone: data.phone,
  };
};

export const upsertStoreProfile = async (userId: string, profile: StoreProfileData) => {
  const { error } = await supabase.from('store_profiles').upsert({
    user_id: userId,
    store_name: profile.store_name,
    owner_name: profile.owner_name,
    address: profile.address,
    phone: profile.phone,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('upsertStoreProfile error:', error);
};

// --- Reset Data ---
export const resetUserData = async (userId: string) => {
  const { error: e1 } = await supabase.from('transactions').delete().eq('user_id', userId);
  if (e1) console.error('resetTransactions error:', e1);
  const { error: e2 } = await supabase.from('daily_status').delete().eq('user_id', userId);
  if (e2) console.error('resetDailyStatus error:', e2);
  const { error: e3 } = await supabase.from('admin_settings').delete().eq('user_id', userId);
  if (e3) console.error('resetAdminSettings error:', e3);
};
