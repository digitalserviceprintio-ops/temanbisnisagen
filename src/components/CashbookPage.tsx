import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatTime } from '@/lib/format';

const CashbookPage = () => {
  const { balance, transactions, setCurrentPage } = useApp();

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('dashboard')} className="mb-4 p-2 bg-primary-foreground/20 rounded-full">
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-xl font-black text-primary-foreground">Buku Kas</h1>
        </div>
        <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">Posisi Kas Laci</p>
          <p className="text-primary-foreground text-2xl font-black mt-1">{formatCurrency(balance.cash)}</p>
        </div>
      </div>

      {/* Mutations */}
      <div className="px-6 mt-6">
        <h3 className="font-black text-sm text-foreground mb-4">Alur Mutasi Kas</h3>
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-card rounded-2xl p-4 flex items-center justify-between shadow-card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'TARIK' ? 'bg-tarik-soft text-tarik' :
                  tx.type === 'SETOR' ? 'bg-setor-soft text-setor' :
                  tx.type === 'TOPUP' ? 'bg-topup-soft text-topup' : 'bg-transfer-soft text-transfer'
                }`}>
                  {tx.type === 'TARIK' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{tx.customerName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{tx.type} · {formatTime(tx.timestamp)}</p>
                </div>
              </div>
              <p className={`text-sm font-black ${tx.type === 'TARIK' ? 'text-tarik' : 'text-setor'}`}>
                {tx.type === 'TARIK' ? '-' : '+'} {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Belum ada mutasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashbookPage;
