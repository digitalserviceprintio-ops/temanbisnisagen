import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const OpenStorePage = () => {
  const { handleOpenStore } = useApp();
  const [cashStart, setCashStart] = useState('');
  const [bankStart, setBankStart] = useState('');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 gradient-success rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-elevated">
            <Store className="w-10 h-10 text-setor-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Shift Baru</h1>
          <p className="text-muted-foreground text-sm mt-1">Masukkan saldo awal hari ini</p>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Kas Laci Awal', value: cashStart, onChange: setCashStart },
            { label: 'Saldo Bank Awal', value: bankStart, onChange: setBankStart },
          ].map(field => (
            <div key={field.label} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{field.label}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
                />
              </div>
            </div>
          ))}

          <button
            onClick={() => handleOpenStore(parseFloat(cashStart) || 0, parseFloat(bankStart) || 0)}
            className="w-full gradient-success text-setor-foreground font-black py-4 rounded-2xl shadow-elevated active:scale-[0.98] transition-transform text-sm uppercase tracking-widest mt-4"
          >
            Mulai Shift
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenStorePage;
