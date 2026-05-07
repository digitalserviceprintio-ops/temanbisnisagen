import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, PlusCircle, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatTime } from '@/lib/format';
import PromoCarousel from './PromoCarousel';
import UpgradeBanner from './UpgradeBanner';

const DigitalClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="text-right">
      <p className="text-primary-foreground text-lg font-black tabular-nums tracking-tight">{timeStr}</p>
      <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">{dateStr}</p>
    </div>
  );
};

const DashboardPage = () => {
  const { user, balance, transactions, setCurrentPage, setShowTransactionModal, setShowTopupModal, storeProfile } = useApp();

  const actions = [
    { id: 'TARIK', label: 'Tarik', icon: <ArrowUpRight className="w-5 h-5" />, colorClass: 'bg-tarik-soft text-tarik' },
    { id: 'SETOR', label: 'Setor', icon: <ArrowDownLeft className="w-5 h-5" />, colorClass: 'bg-setor-soft text-setor' },
    { id: 'TRANSFER', label: 'Transfer', icon: <TrendingUp className="w-5 h-5" />, colorClass: 'bg-transfer-soft text-transfer' },
    { id: 'TOPUP', label: 'TopUp', icon: <PlusCircle className="w-5 h-5" />, colorClass: 'bg-topup-soft text-topup' },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            {storeProfile?.store_name ? (
              <>
                <h2 className="text-primary-foreground text-lg font-black truncate">{storeProfile.store_name}</h2>
                <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest truncate">
                  {storeProfile.owner_name || user?.name} · {storeProfile.phone || user?.phone}
                </p>
                {storeProfile.address && (
                  <p className="text-primary-foreground/50 text-[10px] truncate mt-0.5">{storeProfile.address}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Selamat Bekerja</p>
                <h2 className="text-primary-foreground text-xl font-black mt-1">{user?.name}</h2>
              </>
            )}
          </div>
          <DigitalClock />
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">Kas Laci</p>
            <p className="text-primary-foreground text-lg font-black mt-1">{formatCurrency(balance.cash)}</p>
          </div>
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">Bank</p>
            <p className="text-primary-foreground text-lg font-black mt-1">{formatCurrency(balance.bank)}</p>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      <UpgradeBanner />

      {/* Quick Actions */}
      <div className="px-6 -mt-5">
        <div className="bg-card rounded-3xl p-4 shadow-elevated grid grid-cols-4 gap-2">
          {actions.map(act => (
            <button
              key={act.id}
              onClick={() => act.id === 'TOPUP' ? setShowTopupModal(true) : setShowTransactionModal(act.id)}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl active:scale-95 transition-transform"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${act.colorClass}`}>
                {act.icon}
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Card - Setor Tarik Tunai */}
      <div className="px-6 mt-4">
        <div className="bg-card rounded-3xl overflow-hidden shadow-elevated">
          <div className="relative">
            <img
              src="/images/setor-tarik-info.png"
              alt="Panduan transaksi setor dan tarik tunai"
              className="w-full h-44 object-cover"
              loading="lazy"
              width={800}
              height={1024}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full mb-1.5 backdrop-blur-sm">
                Info
              </span>
              <p className="text-white text-sm font-black leading-tight">Panduan Setor & Tarik Tunai</p>
              <p className="text-white/80 text-[10px] mt-0.5">Catat transaksi dengan rapi dan aman</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-setor-soft text-setor flex items-center justify-center shrink-0 mt-0.5">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Setor Tunai</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                  Terima uang dari nasabah, hitung dengan teliti, lalu catat di buku kas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 mt-3">
              <div className="w-8 h-8 rounded-xl bg-tarik-soft text-tarik flex items-center justify-center shrink-0 mt-0.5">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Tarik Tunai</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                  Keluarkan uang sesuai permintaan nasabah, minta tanda tangan, dan rekam transaksi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Carousel */}
      <PromoCarousel />

      {/* Recent Transactions */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-sm text-foreground">Mutasi Terakhir</h3>
          <button onClick={() => setCurrentPage('cashbook')} className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            Semua <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="bg-card rounded-2xl p-4 flex items-center justify-between shadow-card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'TARIK' ? 'bg-tarik-soft text-tarik' :
                  tx.type === 'TOPUP' ? 'bg-topup-soft text-topup' :
                  tx.type === 'SETOR' ? 'bg-setor-soft text-setor' : 'bg-transfer-soft text-transfer'
                }`}>
                  {tx.type === 'TARIK' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{tx.customerName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{tx.type} · {formatTime(tx.timestamp)}</p>
                </div>
              </div>
              <p className={`text-sm font-black ${tx.type === 'TARIK' ? 'text-tarik' : 'text-setor'}`}>
                {tx.type === 'TARIK' ? '-' : '+'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Belum ada transaksi hari ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
