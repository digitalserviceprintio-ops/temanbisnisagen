import React, { useState } from 'react';
import { LogOut, User, Settings, ChevronRight, Clock, HelpCircle, MessageCircle, Code, RotateCcw, Store, KeyRound, ShieldCheck, Crown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import StoreProfileModal from './StoreProfileModal';
import { APP_VERSION, APP_DEVELOPER } from '@/lib/version';

const AccountPage = () => {
  const { user, handleLogout, setCurrentPage, setShowCloseShift, dailyStatus, handleResetData, licenseInfo, isAdmin } = useApp();
  const [showStoreProfile, setShowStoreProfile] = useState(false);

  const menuItems = [
    {
      label: 'Profil Toko',
      desc: 'Atur nama toko, alamat, dan info lainnya',
      icon: <Store className="w-5 h-5" />,
      colorClass: 'bg-primary/10 text-primary',
      action: () => setShowStoreProfile(true),
    },
    {
      label: 'Atur Biaya Admin',
      desc: 'Kelola biaya per kelipatan transaksi',
      icon: <Settings className="w-5 h-5" />,
      colorClass: 'bg-transfer-soft text-transfer',
      action: () => setCurrentPage('admin-settings'),
    },
    ...(isAdmin ? [
      {
        label: 'Kelola Lisensi',
        desc: 'Buat, cabut, dan kelola kode lisensi',
        icon: <ShieldCheck className="w-5 h-5" />,
        colorClass: 'bg-setor-soft text-setor',
        action: () => setCurrentPage('license-management'),
      },
      {
        label: 'Verifikasi Pembayaran',
        desc: 'Setujui pembayaran & aktivasi lisensi',
        icon: <Crown className="w-5 h-5" />,
        colorClass: 'bg-topup-soft text-topup',
        action: () => setCurrentPage('payment-management'),
      },
    ] : [{
      label: 'Paket & Harga',
      desc: 'Lihat paket premium dan upgrade',
      icon: <Crown className="w-5 h-5" />,
      colorClass: 'bg-topup-soft text-topup',
      action: () => setCurrentPage('pricing'),
    }]),
    {
      label: 'Tutup Shift',
      desc: 'Akhiri shift dan lihat ringkasan',
      icon: <Clock className="w-5 h-5" />,
      colorClass: 'bg-tarik-soft text-tarik',
      action: () => setShowCloseShift(true),
      disabled: !dailyStatus || dailyStatus.status === 'CLOSED',
    },
    {
      label: 'Pertanyaan Tentang Aplikasi',
      desc: 'FAQ dan panduan penggunaan',
      icon: <HelpCircle className="w-5 h-5" />,
      colorClass: 'bg-setor-soft text-setor',
      action: () => setCurrentPage('faq'),
    },
    {
      label: 'Hubungi Helpdesk',
      desc: 'Chat via WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      colorClass: 'bg-topup-soft text-topup',
      action: () => window.open('https://wa.me/6282186371356', '_blank'),
    },
    {
      label: 'Reset Data',
      desc: 'Hapus semua data transaksi & shift',
      icon: <RotateCcw className="w-5 h-5" />,
      colorClass: 'bg-destructive/10 text-destructive',
      action: () => {
        if (window.confirm('Yakin ingin menghapus semua data transaksi dan shift? Data yang sudah dihapus tidak bisa dikembalikan.')) {
          handleResetData();
        }
      },
    },
  ];

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-black text-primary-foreground">Akun Saya</h1>
      </div>

      <div className="px-6 -mt-5 space-y-4">
        <div className="bg-card rounded-3xl p-6 shadow-elevated flex items-center gap-4">
          <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.phone}</p>
            {isAdmin && <span className="px-2 py-0.5 bg-setor-soft text-setor text-[10px] font-bold rounded-full">Admin</span>}
          </div>
        </div>

        {/* License info */}
        {licenseInfo?.valid && !isAdmin && (
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border flex items-center gap-3">
            <div className="w-10 h-10 bg-setor-soft rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-setor" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">Lisensi Aktif</p>
              <p className="text-[10px] text-muted-foreground">
                Berlaku {licenseInfo.days_remaining} hari lagi · 
                s/d {licenseInfo.expires_at ? new Date(licenseInfo.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </p>
            </div>
          </div>
        )}

        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            disabled={item.disabled}
            className="w-full p-4 bg-card rounded-3xl flex items-center gap-4 border border-border shadow-card active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.colorClass}`}>
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full p-5 bg-card rounded-3xl flex items-center gap-3 text-destructive font-bold text-xs uppercase tracking-widest border border-border shadow-card active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" />
          Keluar Aplikasi
        </button>

        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <Code className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider">
            Developed by <span className="font-black">AD-2026</span> · V.1.0
          </p>
        </div>
      </div>

      <StoreProfileModal open={showStoreProfile} onClose={() => setShowStoreProfile(false)} />
    </div>
  );
};

export default AccountPage;
