import React, { useState } from 'react';
import { ShieldCheck, Smartphone, UserPlus, KeyRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const AuthPage = () => {
  const { handleLogin, handleRegister } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ phone: '', pin: '', name: '' });

  const onSubmit = () => {
    if (authMode === 'login') {
      handleLogin(formData.phone, formData.pin);
    } else {
      handleRegister(formData);
      setAuthMode('login');
      setFormData({ phone: '', pin: '', name: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-elevated">
            <ShieldCheck className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Buku Agen</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {authMode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {authMode === 'register' && (
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
          )}

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

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">PIN (6 Digit)</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium tracking-[0.5em]"
              />
            </div>
          </div>

          <button
            onClick={onSubmit}
            className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated active:scale-[0.98] transition-transform text-sm uppercase tracking-widest mt-2"
          >
            {authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
          </button>
        </div>

        {/* Toggle */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-xs">
            {authMode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          </p>
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-primary font-bold text-xs uppercase tracking-widest mt-2 hover:underline"
          >
            {authMode === 'login' ? 'Daftar Akun Baru' : 'Kembali Ke Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
