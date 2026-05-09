import React from 'react';
import { LayoutDashboard, Wallet, TrendingUp, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { PageId } from '@/types/app';

const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'cashbook', label: 'Buku Kas', icon: <Wallet className="w-5 h-5" /> },
  { id: 'report', label: 'Laporan', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'account', label: 'Akun', icon: <User className="w-5 h-5" /> },
];

const BottomNav = () => {
  const { currentPage, setCurrentPage } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 print:hidden pointer-events-none">
      <nav className="pointer-events-auto max-w-lg mx-auto m-3 px-2 py-2 glass rounded-3xl shadow-glow flex justify-around items-center">
        {navItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${
                active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {active && (
                <span className="absolute inset-0 gradient-primary rounded-2xl shadow-elevated -z-0" />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
