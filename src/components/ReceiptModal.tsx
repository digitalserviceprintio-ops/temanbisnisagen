import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';

const ReceiptModal = () => {
  const { showReceipt, setShowReceipt } = useApp();
  if (!showReceipt) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card w-full max-w-sm rounded-3xl p-8 text-center animate-scale-in shadow-modal">
        <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-setor-foreground" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-6">Berhasil!</h2>

        <div className="space-y-3 text-left bg-muted rounded-2xl p-4 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Nasabah</span>
            <span className="text-sm font-bold text-foreground">{showReceipt.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tipe</span>
            <span className={`text-sm font-bold ${
              showReceipt.type === 'TARIK' ? 'text-tarik' :
              showReceipt.type === 'SETOR' ? 'text-setor' : 'text-transfer'
            }`}>{showReceipt.type}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="text-sm font-bold text-foreground">Total Bayar</span>
            <span className="text-lg font-black text-foreground">{formatCurrency(showReceipt.amount + showReceipt.fee)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowReceipt(null)}
          className="w-full gradient-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-[0.98] transition-transform"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;
