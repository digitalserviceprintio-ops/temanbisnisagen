import { useState, useEffect, useCallback } from 'react';
import { syncOfflineQueue, getOfflineQueue } from '@/lib/offline';
import { insertTransaction } from '@/lib/supabase-data';

export const useOnlineStatus = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getOfflineQueue().length);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getOfflineQueue().length);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (online && pendingCount > 0) {
      syncOfflineQueue(async (tx, userId, shiftDate) => {
        await insertTransaction(tx, userId, shiftDate);
      }).then((synced) => {
        if (synced > 0) {
          refreshPendingCount();
        }
      });
    }
  }, [online, pendingCount, refreshPendingCount]);

  return { online, pendingCount, refreshPendingCount };
};
