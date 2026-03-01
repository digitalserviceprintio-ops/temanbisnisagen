import React from 'react';
import { ChevronLeft, Search, FileDown, Printer, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Transaction } from '@/types/app';

const ReportPage = () => {
  const { transactions, setCurrentPage, searchQuery, setSearchQuery } = useApp();

  const stats = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'TOPUP') {
        acc.topup += tx.amount;
      } else {
        acc.adminFee += tx.fee;
        acc.volume += tx.amount;
      }
      return acc;
    },
    { adminFee: 0, volume: 0, topup: 0 }
  );

  const filtered = transactions.filter(
    tx =>
      tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'ID,Waktu,Tipe,Nasabah,Nominal,Fee,Tujuan\n';
    transactions.forEach(tx => {
      csv += [tx.id, new Date(tx.timestamp).toLocaleString(), tx.type, tx.customerName, tx.amount, tx.fee, tx.target].join(',') + '\n';
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `Laporan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('dashboard')} className="mb-4 p-2 bg-primary-foreground/20 rounded-full print:hidden">
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-xl font-black text-primary-foreground">Laporan</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">Total Admin Fee</p>
            <p className="text-primary-foreground text-lg font-black mt-1">{formatCurrency(stats.adminFee)}</p>
          </div>
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">Volume TRX</p>
            <p className="text-primary-foreground text-lg font-black mt-1">{formatCurrency(stats.volume)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-4">
        {/* Monthly Report Button */}
        <button
          onClick={() => setCurrentPage('monthly-report')}
          className="w-full bg-card border border-border rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-black text-primary active:scale-95 transition-transform shadow-card"
        >
          <TrendingUp className="w-4 h-4" /> Laporan Bulanan & Grafik
        </button>

        {/* Export Buttons */}
        <div className="flex gap-3 print:hidden">
          <button onClick={exportCSV} className="flex-1 bg-card border border-border rounded-2xl py-3 flex items-center justify-center gap-2 text-xs font-bold text-foreground active:scale-95 transition-transform shadow-card">
            <FileDown className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 bg-card border border-border rounded-2xl py-3 flex items-center justify-center gap-2 text-xs font-bold text-foreground active:scale-95 transition-transform shadow-card">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* Search */}
        <div className="relative print:hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm text-foreground">Riwayat Detail</h3>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{filtered.length} Transaksi</span>
          </div>
          <div className="space-y-3">
            {filtered.map(tx => (
              <div key={tx.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{tx.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        tx.type === 'TARIK' ? 'bg-tarik-soft text-tarik' :
                        tx.type === 'SETOR' ? 'bg-setor-soft text-setor' :
                        tx.type === 'TOPUP' ? 'bg-topup-soft text-topup' : 'bg-transfer-soft text-transfer'
                      }`}>{tx.type}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(tx.timestamp).split(',')[1]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === 'TARIK' ? 'text-tarik' : 'text-setor'}`}>
                      {tx.type === 'TARIK' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    {tx.fee > 0 && <p className="text-[10px] text-muted-foreground">Fee: {formatCurrency(tx.fee)}</p>}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-12 text-muted-foreground text-sm">Tidak ada data ditemukan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
