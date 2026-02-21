import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const TopupModal = () => {
  const { showTopupModal, setShowTopupModal, handleTopup, user } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ type: 'CASH', amount: '', source: '' });
  const [pin, setPin] = useState('');

  if (!showTopupModal) return null;

  const onConfirm = () => {
    if (pin === user?.pin) {
      handleTopup({ type: formData.type, amount: parseFloat(formData.amount), source: formData.source });
      setStep(1);
      setFormData({ type: 'CASH', amount: '', source: '' });
      setPin('');
    }
  };

  const onClose = () => {
    setShowTopupModal(false);
    setStep(1);
    setFormData({ type: 'CASH', amount: '', source: '' });
    setPin('');
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
            {/* Type Toggle */}
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

            <button onClick={() => setStep(2)} disabled={!formData.amount || parseFloat(formData.amount) <= 0 || !formData.source}
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
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Masukkan PIN</label>
              <input type="password" maxLength={6} placeholder="••••••" value={pin} onChange={e => setPin(e.target.value)}
                className="w-full px-4 py-4 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm tracking-[0.5em] text-center font-bold" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Kembali</button>
              <button onClick={onConfirm} className="flex-1 gradient-primary text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-transform">
                Konfirmasi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopupModal;
