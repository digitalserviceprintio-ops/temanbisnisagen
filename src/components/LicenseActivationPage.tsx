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

        {/* Premium upgrade offer */}
        <div className="bg-card rounded-3xl p-5 shadow-card border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-topup-soft rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-topup" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Upgrade ke Premium</p>
              <p className="text-[10px] text-muted-foreground">Akses tanpa batas & fitur lengkap</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-setor">✓</span> 90 hari — Rp 50.000</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-setor">✓</span> 365 hari — Rp 150.000</div>
          </div>
          <button
            onClick={() => window.open('https://wa.me/6282186371356?text=Halo%2C%20saya%20ingin%20upgrade%20ke%20Premium%20Teman%20Bisnis%20Agen', '_blank')}
            className="w-full py-3 bg-topup text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Admin via WhatsApp
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Punya kode lisensi? Masukkan di atas untuk mengaktifkan.
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
