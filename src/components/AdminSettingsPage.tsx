import React, { useState } from 'react';
import { ChevronLeft, Settings, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';

const AdminSettingsPage = () => {
  const { adminSettings, updateAdminSettings, setCurrentPage } = useApp();
  const [settings, setSettings] = useState({ ...adminSettings });

  const types = [
    { key: 'tarik' as const, label: 'Tarik Tunai', colorClass: 'bg-tarik-soft text-tarik border-tarik/20' },
    { key: 'setor' as const, label: 'Setor Tunai', colorClass: 'bg-setor-soft text-setor border-setor/20' },
    { key: 'transfer' as const, label: 'Transfer Bank', colorClass: 'bg-transfer-soft text-transfer border-transfer/20' },
  ];

  const handleSave = () => {
    updateAdminSettings(settings);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="mb-4 p-2 bg-primary-foreground/20 rounded-full">
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-xl font-black text-primary-foreground">Atur Biaya Admin</h1>
        </div>
        <p className="text-primary-foreground/60 text-xs mt-2">Biaya dihitung per kelipatan nominal transaksi</p>
      </div>

      <div className="px-6 mt-6 space-y-4">
        {types.map(t => (
          <div key={t.key} className={`bg-card rounded-3xl p-5 shadow-card border ${t.colorClass.split(' ')[2] || 'border-border'}`}>
            <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${t.colorClass.split(' ')[1]}`}>{t.label}</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Biaya Admin per Kelipatan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
                  <input
                    type="number"
                    value={settings[t.key].fee}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      [t.key]: { ...prev[t.key], fee: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kelipatan (Step)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
                  <input
                    type="number"
                    value={settings[t.key].step}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      [t.key]: { ...prev[t.key], step: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-muted rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Contoh Kalkulasi</p>
                <div className="space-y-1">
                  {[1, 2, 3, 5].map(mult => {
                    const amount = mult * (settings[t.key].step || 1);
                    const fee = mult * settings[t.key].fee;
                    return (
                      <div key={mult} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                        <span className="font-bold text-foreground">Fee: {formatCurrency(fee)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated active:scale-[0.98] transition-transform text-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
