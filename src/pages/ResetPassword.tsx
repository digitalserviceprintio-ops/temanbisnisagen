import React, { useState, useEffect } from 'react';
import { KeyRound, Loader2, CheckCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (password !== confirmPassword) { setError('Password tidak cocok'); return; }
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!ready && !success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Memverifikasi link reset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          {success ? (
            <>
              <div className="w-16 h-16 bg-setor-soft rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-setor" />
              </div>
              <h2 className="text-xl font-black text-foreground">Password Berhasil Diubah!</h2>
              <p className="text-sm text-muted-foreground mt-2">Anda bisa login dengan password baru.</p>
              <a href="/" className="block w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated text-sm uppercase tracking-widest mt-6 text-center">
                Kembali ke Login
              </a>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-2">Masukkan password baru Anda</p>

              {error && (
                <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-2xl mt-4 text-center">{error}</div>
              )}

              <div className="space-y-4 mt-6 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password Baru</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Konfirmasi Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button onClick={handleReset} disabled={loading}
                  className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated active:scale-[0.98] transition-transform text-sm uppercase tracking-widest disabled:opacity-60">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan Password Baru'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
