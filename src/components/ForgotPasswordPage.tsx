import React, { useState } from 'react';
import { ChevronLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordPage = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) { setError('Masukkan email Anda'); return; }
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">
        <button onClick={onBack} className="mb-6 p-2 bg-muted rounded-full">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-setor-soft rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-setor" />
            </div>
            <h2 className="text-xl font-black text-foreground">Email Terkirim!</h2>
            <p className="text-sm text-muted-foreground">Silakan cek inbox email <strong>{email}</strong> untuk link reset password.</p>
            <button onClick={onBack} className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated text-sm uppercase tracking-widest mt-4">
              Kembali ke Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-foreground">Lupa Password</h2>
              <p className="text-sm text-muted-foreground mt-2">Masukkan email terdaftar untuk menerima link reset password</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-2xl mb-4 text-center">{error}</div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated active:scale-[0.98] transition-transform text-sm uppercase tracking-widest disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Kirim Link Reset'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
