import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';

const TransactionModal = () => {
  const { showTransactionModal, setShowTransactionModal, handleTransaction, adminSettings } = useApp();
  const [amount, setAmount] = useState('');
  const [manualFee, setManualFee] = useState<number | null>(null);
  const [custName, setCustName] = useState('');
  const [target, setTarget] = useState('');

  if (!showTransactionModal) return null;

  const type = showTransactionModal.toLowerCase() as 'tarik' | 'setor' | 'transfer';
  const config = {
    tarik: { title: 'Tarik Tunai', icon: <ArrowUpRight className="w-5 h-5" />, colorClass: 'bg-tarik-soft text-tarik' },
    setor: { title: 'Setor Tunai', icon: <ArrowDownLeft className="w-5 h-5" />, colorClass: 'bg-setor-soft text-setor' },
    transfer: { title: 'Transfer Bank', icon: <TrendingUp className="w-5 h-5" />, colorClass: 'bg-transfer-soft text-transfer' },
  }[type];

  const autoFee = adminSettings[type]?.fee || 5000;
  const currentFee = manualFee !== null ? manualFee : autoFee;

  const onSubmit = () => {
    handleTransaction(showTransactionModal.toUpperCase(), parseFloat(amount), currentFee, { customerName: custName, target });
    setAmount('');
    setManualFee(null);
    setCustName('');
    setTarget('');
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end animate-fade-in" onClick={() => setShowTransactionModal(null)}>
      <div className="bg-card w-full max-w-lg mx-auto rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.colorClass}`}>
              {config.icon}
            </div>
            <h2 className="text-lg font-black text-foreground">{config.title}</h2>
          </div>
          <button onClick={() => setShowTransactionModal(null)} className="p-2 bg-muted rounded-full">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
              <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
            </div>
          </div>

          {/* Fee + Total */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admin Fee</label>
              <input type="number" value={currentFee} onChange={e => setManualFee(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-muted rounded-2xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</label>
              <p className="px-4 py-3 bg-muted rounded-2xl text-foreground text-sm font-black">
                {formatCurrency((parseFloat(amount) || 0) + currentFee)}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Nama nasabah" value={custName} onChange={e => setCustName(e.target.value)}
              className="px-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="text" placeholder="Tujuan / No. Rek" value={target} onChange={e => setTarget(e.target.value)}
              className="px-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <button
            onClick={onSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated disabled:opacity-40 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest"
          >
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
