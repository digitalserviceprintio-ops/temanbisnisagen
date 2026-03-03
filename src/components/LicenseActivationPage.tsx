import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { activateLicense, type LicenseInfo } from '@/lib/license-data';

interface Props {
  userId: string;
  userEmail: string;
  licenseInfo: LicenseInfo | null;
  onActivated: () => void;
  onLogout: () => void;
}

const LicenseActivationPage = ({ userId, userEmail, licenseInfo, onActivated, onLogout }: Props) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleActivate = async () => {
    if (!key.trim()) { setError('Masukkan kode lisensi'); return; }
    setLoading(true);
    setError('');
    const result = await activateLicense(key, userId, userEmail);
    setLoading(false);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(onActivated, 1500);
    } else {
      setError(result.message);
    }
  };

  const isExpired = licenseInfo && !licenseInfo.valid;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto">
            {isExpired ? <Clock className="w-8 h-8 text-primary-foreground" /> : <KeyRound className="w-8 h-8 text-primary-foreground" />}
          </div>
          <h1 className="text-xl font-black text-foreground">
            {isExpired ? 'Lisensi Kedaluwarsa' : 'Aktivasi Lisensi'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isExpired
              ? 'Lisensi Anda telah berakhir. Masukkan kode lisensi baru untuk melanjutkan.'
              : 'Masukkan kode lisensi untuk mengaktifkan aplikasi.'}
          </p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-elevated space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kode Lisensi</label>
            <input
              type="text"
              value={key}
              onChange={e => { setKey(e.target.value.toUpperCase()); setError(''); }}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full mt-2 px-4 py-3 bg-secondary rounded-xl text-center text-lg font-mono font-bold tracking-[0.2em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={19}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-setor text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              {success}
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading || !key.trim()}
            className="w-full py-3 gradient-primary text-primary-foreground font-bold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? 'Memproses...' : 'Aktifkan Lisensi'}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Hubungi admin untuk mendapatkan kode lisensi.
        </p>

        <button
          onClick={onLogout}
          className="w-full py-3 text-destructive font-bold text-xs uppercase tracking-widest"
        >
          Keluar
        </button>
      </div>
    </div>
  );
};

export default LicenseActivationPage;
