import { supabase } from '@/integrations/supabase/client';

export interface LicenseInfo {
  valid: boolean;
  license_key?: string;
  expires_at?: string;
  days_remaining?: number;
}

export interface LicenseRow {
  id: string;
  license_key: string;
  user_id: string | null;
  user_email: string | null;
  duration_days: number;
  activated_at: string | null;
  expires_at: string | null;
  status: string;
  created_at: string;
  note: string;
}

export const checkLicense = async (userId: string): Promise<LicenseInfo> => {
  const { data, error } = await supabase.rpc('check_license', { _user_id: userId });
  if (error) { console.error('checkLicense error:', error); return { valid: false }; }
  return data as unknown as LicenseInfo;
};

export const activateLicense = async (licenseKey: string, userId: string, userEmail: string) => {
  const { data, error } = await supabase.rpc('activate_license', {
    _license_key: licenseKey.trim(),
    _user_id: userId,
    _user_email: userEmail,
  });
  if (error) { console.error('activateLicense error:', error); return { success: false, message: 'Terjadi kesalahan' }; }
  return data as unknown as { success: boolean; message: string; expires_at?: string; duration_days?: number };
};

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (error) { console.error('checkIsAdmin error:', error); return false; }
  return !!data;
};

// Admin functions
export const fetchAllLicenses = async (): Promise<LicenseRow[]> => {
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAllLicenses error:', error); return []; }
  return (data || []) as unknown as LicenseRow[];
};

export const createLicense = async (durationDays: number, note: string, createdBy: string) => {
  const key = generateLicenseKey();
  const { error } = await supabase.from('licenses').insert({
    license_key: key,
    duration_days: durationDays,
    note,
    created_by: createdBy,
  } as any);
  if (error) { console.error('createLicense error:', error); return null; }
  return key;
};

export const revokeLicense = async (licenseId: string) => {
  const { error } = await supabase
    .from('licenses')
    .update({ status: 'revoked' } as any)
    .eq('id', licenseId);
  if (error) console.error('revokeLicense error:', error);
};

export const deleteLicense = async (licenseId: string) => {
  const { error } = await supabase
    .from('licenses')
    .delete()
    .eq('id', licenseId);
  if (error) console.error('deleteLicense error:', error);
};

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segLen = 4;
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let seg = '';
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(seg);
  }
  return parts.join('-');
}
