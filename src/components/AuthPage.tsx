import React, { useState } from 'react';
import { ShieldCheck, Smartphone, UserPlus, KeyRound, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ForgotPasswordPage from './ForgotPasswordPage';

const AuthPage = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        if (formData.password.length < 6) {
          setError('Password minimal 6 karakter!');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name, phone: formData.phone },
          },
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'forgot') return <ForgotPasswordPage onBack={() => setAuthMode('login')} />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-elevated">
            <ShieldCheck className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Teman Agen Bisnis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {authMode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-2xl mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {authMode === 'register' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nomor HP</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="email@contoh.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated active:scale-[0.98] transition-transform text-sm uppercase tracking-widest mt-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
          </button>
        </div>

        {/* Toggle & Forgot */}
        <div className="text-center mt-8 space-y-3">
          {authMode === 'login' && (
            <button
              onClick={() => setAuthMode('forgot')}
              className="text-muted-foreground text-xs hover:underline"
            >
              Lupa Password?
            </button>
          )}
          <p className="text-muted-foreground text-xs">
            {authMode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          </p>
          <button
            onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
          >
            {authMode === 'login' ? 'Daftar Akun Baru' : 'Kembali Ke Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
