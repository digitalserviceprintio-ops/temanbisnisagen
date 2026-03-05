import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

const OfflineIndicator = () => {
  const { online, pendingCount } = useOnlineStatus();

  if (online && pendingCount === 0) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 ${
      online 
        ? 'bg-amber-500 text-white' 
        : 'bg-destructive text-destructive-foreground'
    }`}>
      {online ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Menyinkronkan {pendingCount} transaksi...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Mode Offline — Transaksi akan disimpan lokal</span>
          {pendingCount > 0 && <span className="ml-1">({pendingCount} pending)</span>}
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
