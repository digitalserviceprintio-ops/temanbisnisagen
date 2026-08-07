import React, { useState } from 'react';
import { Smartphone, UserPlus, KeyRound, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ForgotPasswordPage from './ForgotPasswordPage';
import logoTba from '@/assets/logo-tba.png';
import { getErrorMessage } from '@/lib/utils';

const AuthPage = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const translateError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Email atau password salah!';
    if (m.includes('email not confirmed')) return 'Email belum diverifikasi. Silakan cek inbox Anda.';
    if (m.includes('user already registered') || m.includes('already been registered')) return 'Email sudah terdaftar. Silakan login.';
    if (m.includes('password should be at least')) return 'Password minimal 6 karakter!';
    if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Format email tidak valid!';
    if (m.includes('rate limit') || m.includes('too many')) return 'Terlalu banyak percobaan. Coba lagi nanti.';
    if (m.includes('network') || m.includes('fetch')) return 'Koneksi bermasalah. Cek internet Anda.';
    return msg;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError('Email dan password wajib diisi!');
      return;
    }
    if (!validateEmail(email)) {
      setError('Format email tidak valid!');
      return;
    }
    if (authMode === 'register') {
      if (!formData.name.trim()) { setError('Nama lengkap wajib diisi!'); return; }
      if (!formData.phone.trim()) { setError('Nomor HP wajib diisi!'); return; }
      if (!/^08\d{8,12}$/.test(formData.phone.trim())) { setError('Nomor HP tidak valid (contoh: 08xxxxxxxxxx)'); return; }
      if (password.length < 6) { setError('Password minimal 6 karakter!'); return; }
    }

    setLoading(true);
    // Safety timeout — never let the button hang forever
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Koneksi lambat. Silakan coba lagi.');
    }, 20000);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name: formData.name.trim(), phone: formData.phone.trim() },
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        }
      }
    } catch (err: unknown) {
      setError(translateError(getErrorMessage(err)));
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (authMode === 'forgot') return <ForgotPasswordPage onBack={() => setAuthMode('login')} />;

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-0 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="relative w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float">
            <img src={logoTba} alt="Teman Bisnis Agen Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Teman Bisnis Agen</h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            {authMode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold p-3 rounded-2xl mb-4 text-center">
            {success}
          </div>
        )}

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
            onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
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
