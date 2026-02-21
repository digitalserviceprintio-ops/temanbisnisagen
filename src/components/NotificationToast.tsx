import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const NotificationToast = () => {
  const { notifications } = useApp();

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] space-y-2 max-w-lg mx-auto pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="bg-foreground text-primary-foreground px-4 py-3 rounded-2xl flex items-center gap-3 shadow-modal animate-toast-in pointer-events-auto">
          <CheckCircle2 className="w-5 h-5 text-setor flex-shrink-0" />
          <span className="text-sm font-bold">{n.message}</span>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
