import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const AccountPage = () => {
  const { user, handleLogout } = useApp();

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
          </div>
        </div>

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
