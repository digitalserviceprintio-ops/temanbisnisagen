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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 flex justify-around items-center z-50 print:hidden max-w-lg mx-auto">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all ${
            currentPage === item.id
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
