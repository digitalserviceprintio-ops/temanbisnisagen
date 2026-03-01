import React, { useState } from 'react';
import { X, PlusCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

const TopupModal = () => {
  const { showTopupModal, setShowTopupModal, handleTopup } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ type: 'CASH', amount: '', source: '' });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showTopupModal) return null;

  const onConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User tidak ditemukan');

      // Verify password by re-signing in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (authError) throw new Error('Password salah!');

      handleTopup({ type: formData.type, amount: parseFloat(formData.amount), source: formData.source });
      setStep(1);
      setFormData({ type: 'CASH', amount: '', source: '' });
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Verifikasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setShowTopupModal(false);
    setStep(1);
    setFormData({ type: 'CASH', amount: '', source: '' });
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg mx-auto rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-topup-soft text-topup">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-foreground">Top Up Saldo</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-muted rounded-full">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex bg-muted rounded-2xl p-1">
              {['CASH', 'BANK'].map(t => (
                <button key={t} onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    formData.type === t ? 'bg-card shadow-card text-primary' : 'text-muted-foreground'
                  }`}>
                  {t === 'CASH' ? 'Kas Laci' : 'Rekening'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nominal Top Up</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
                <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sumber Dana</label>
              <input type="text" placeholder="e.g. Transfer dari BCA" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-4 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            </div>

            <button onClick={() => { setStep(2); setError(''); }} disabled={!formData.amount || parseFloat(formData.amount) <= 0 || !formData.source}
              className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated disabled:opacity-40 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest">
              Lanjutkan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center bg-muted rounded-2xl p-6">
              <p className="text-2xl font-black text-foreground">Rp {parseFloat(formData.amount).toLocaleString('id-ID')}</p>
              <p className="text-sm text-muted-foreground mt-1">{formData.source}</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-2xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Masukkan Password Login</label>
              <input type={showPassword ? 'text' : 'password'} placeholder="Password akun Anda" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 pr-12 py-4 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm text-center font-bold" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setError(''); }} className="flex-1 py-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Kembali</button>
              <button onClick={onConfirm} disabled={loading || !password}
                className="flex-1 gradient-primary text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-40">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Konfirmasi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopupModal;
