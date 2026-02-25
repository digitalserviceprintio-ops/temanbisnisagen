import React from 'react';
import { LogOut, User, Settings, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const AccountPage = () => {
  const { user, handleLogout, setCurrentPage, setShowCloseShift, dailyStatus } = useApp();

  const menuItems = [
    {
      label: 'Atur Biaya Admin',
      desc: 'Kelola biaya per kelipatan transaksi',
      icon: <Settings className="w-5 h-5" />,
      colorClass: 'bg-transfer-soft text-transfer',
      action: () => setCurrentPage('admin-settings'),
    },
    {
      label: 'Tutup Shift',
      desc: 'Akhiri shift dan lihat ringkasan',
      icon: <Clock className="w-5 h-5" />,
      colorClass: 'bg-tarik-soft text-tarik',
      action: () => setShowCloseShift(true),
      disabled: !dailyStatus || dailyStatus.status === 'CLOSED',
    },
  ];

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-black text-primary-foreground">Akun Saya</h1>
      </div>

      <div className="px-6 -mt-5 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 shadow-elevated flex items-center gap-4">
          <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.phone}</p>
          </div>
        </div>

        {/* Menu Items */}
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full p-5 bg-card rounded-3xl flex items-center gap-3 text-destructive font-bold text-xs uppercase tracking-widest border border-border shadow-card active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" />
          Keluar Aplikasi
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
