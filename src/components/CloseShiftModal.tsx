import React from 'react';
import { X, Clock, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import type { ShiftSummary } from '@/types/app';

const CloseShiftModal = () => {
  const { showCloseShift, setShowCloseShift, handleCloseShift, transactions, balance, dailyStatus } = useApp();

  if (!showCloseShift || !dailyStatus) return null;

  const summary: ShiftSummary = transactions.reduce(
    (acc, tx) => {
      if (tx.type !== 'TOPUP') {
        acc.totalAdminFee += tx.fee;
        acc.totalVolume += tx.amount;
      }
      acc.totalTransactions++;
      if (tx.type === 'TARIK') acc.tarikCount++;
      if (tx.type === 'SETOR') acc.setorCount++;
      if (tx.type === 'TRANSFER') acc.transferCount++;
      if (tx.type === 'TOPUP') acc.topupCount++;
      return acc;
    },
    {
      totalTransactions: 0,
      totalAdminFee: 0,
      totalVolume: 0,
      cashStart: dailyStatus.cashStart,
      cashEnd: balance.cash,
      cashDifference: balance.cash - dailyStatus.cashStart,
      bankStart: dailyStatus.bankStart,
      bankEnd: balance.bank,
      bankDifference: balance.bank - dailyStatus.bankStart,
      tarikCount: 0,
      setorCount: 0,
      transferCount: 0,
      topupCount: 0,
    }
  );

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end animate-fade-in" onClick={() => setShowCloseShift(false)}>
      <div className="bg-card w-full max-w-lg mx-auto rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-foreground">Tutup Shift</h2>
          </div>
          <button onClick={() => setShowCloseShift(false)} className="p-2 bg-muted rounded-full">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Admin Fee Summary */}
        <div className="gradient-hero rounded-2xl p-5 mb-4">
          <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">Total Pendapatan Admin Fee</p>
          <p className="text-primary-foreground text-2xl font-black mt-1">{formatCurrency(summary.totalAdminFee)}</p>
          <p className="text-primary-foreground/60 text-xs mt-1">{summary.totalTransactions} transaksi hari ini</p>
        </div>

        {/* Transaction Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-tarik-soft rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-tarik" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-tarik">Tarik</span>
            </div>
            <p className="text-foreground font-black">{summary.tarikCount} trx</p>
          </div>
          <div className="bg-setor-soft rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-setor" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-setor">Setor</span>
            </div>
            <p className="text-foreground font-black">{summary.setorCount} trx</p>
          </div>
          <div className="bg-transfer-soft rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-transfer" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-transfer">Transfer</span>
            </div>
            <p className="text-foreground font-black">{summary.transferCount} trx</p>
          </div>
          <div className="bg-topup-soft rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-topup" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Up</span>
            </div>
            <p className="text-foreground font-black">{summary.topupCount} trx</p>
          </div>
        </div>

        {/* Cash Difference */}
        <div className="bg-muted rounded-2xl p-4 space-y-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selisih Kas</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Kas Laci Awal</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(summary.cashStart)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Kas Laci Akhir</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(summary.cashEnd)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-bold text-foreground">Selisih Kas</span>
              <span className={`text-sm font-black ${summary.cashDifference >= 0 ? 'text-setor' : 'text-destructive'}`}>
                {summary.cashDifference >= 0 ? '+' : ''}{formatCurrency(summary.cashDifference)}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Difference */}
        <div className="bg-muted rounded-2xl p-4 space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selisih Bank</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bank Awal</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(summary.bankStart)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bank Akhir</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(summary.bankEnd)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-bold text-foreground">Selisih Bank</span>
              <span className={`text-sm font-black ${summary.bankDifference >= 0 ? 'text-setor' : 'text-destructive'}`}>
                {summary.bankDifference >= 0 ? '+' : ''}{formatCurrency(summary.bankDifference)}
              </span>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="bg-muted rounded-2xl p-4 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Volume Transaksi</span>
            <span className="text-sm font-black text-foreground">{formatCurrency(summary.totalVolume)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => setShowCloseShift(false)} className="flex-1 py-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">
            Batal
          </button>
          <button
            onClick={handleCloseShift}
            className="flex-1 bg-destructive text-destructive-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            Tutup Shift
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseShiftModal;
