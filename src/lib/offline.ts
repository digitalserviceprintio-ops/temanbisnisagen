import { Transaction } from '@/types/app';

const OFFLINE_QUEUE_KEY = 'tba_offline_queue';

interface QueuedTransaction {
  tx: Transaction;
  userId: string;
  shiftDate: string;
  queuedAt: string;
}

export const isOnline = () => navigator.onLine;

export const getOfflineQueue = (): QueuedTransaction[] => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToOfflineQueue = (tx: Transaction, userId: string, shiftDate: string) => {
  const queue = getOfflineQueue();
  queue.push({ tx, userId, shiftDate, queuedAt: new Date().toISOString() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const syncOfflineQueue = async (
  insertFn: (tx: Transaction, userId: string, shiftDate: string) => Promise<void>
): Promise<number> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  const failed: QueuedTransaction[] = [];

  for (const item of queue) {
    try {
      await insertFn(item.tx, item.userId, item.shiftDate);
      synced++;
    } catch {
      failed.push(item);
    }
  }

  if (failed.length > 0) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
  } else {
    clearOfflineQueue();
  }

  return synced;
};
