import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatTime } from '@/lib/format';

const CashbookPage = () => {
  const { balance, transactions, setCurrentPage } = useApp();

  return (
    <div className="pb-24">
      {/* Header — premium hero */}
      <div className="relative gradient-hero hero-glow px-6 pt-12 pb-10 rounded-b-[2.5rem] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <button onClick={() => setCurrentPage('dashboard')} className="relative mb-4 p-2.5 glass-card rounded-full hover:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="relative flex items-center gap-3 mb-5">
          <Wallet className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-2xl font-display font-bold text-primary-foreground">Buku Kas</h1>
        </div>
        <div className="relative glass-card rounded-2xl p-5">
          <p className="text-primary-foreground/70 text-[10px] font-semibold uppercase tracking-widest">Posisi Kas Laci</p>
          <p className="text-primary-foreground text-3xl font-display font-bold mt-1.5 tabular-nums">{formatCurrency(balance.cash)}</p>
        </div>
      </div>

      {/* Mutations */}
      <div className="px-6 mt-6">
        <h3 className="font-display font-bold text-base text-foreground mb-4">Alur Mutasi Kas</h3>
        <div className="space-y-2.5">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-card rounded-2xl p-4 flex items-center justify-between shadow-card border border-border/50 hover:shadow-soft transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  tx.type === 'TARIK' ? 'bg-tarik-soft text-tarik' :
                  tx.type === 'SETOR' ? 'bg-setor-soft text-setor' :
                  tx.type === 'TOPUP' ? 'bg-topup-soft text-topup' : 'bg-transfer-soft text-transfer'
                }`}>
                  {tx.type === 'TARIK' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tx.customerName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{tx.type} · {formatTime(tx.timestamp)}</p>
                </div>
              </div>
              <p className={`text-sm font-display font-bold tabular-nums ${tx.type === 'TARIK' ? 'text-tarik' : 'text-setor'}`}>
                {tx.type === 'TARIK' ? '-' : '+'} {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-16">
              <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Belum ada mutasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashbookPage;
