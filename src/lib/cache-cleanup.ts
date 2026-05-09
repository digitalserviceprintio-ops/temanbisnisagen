import { APP_VERSION } from './version';

/**
 * One-time cache cleanup per app version.
 * Removes stale CacheStorage entries and unregisters obsolete service workers
 * so the app boots fresh and lightweight after each release.
 */
export const runCacheCleanup = async () => {
  try {
    const KEY = 'tba_last_clean_version';
    const last = localStorage.getItem(KEY);
    if (last === APP_VERSION) return;

    // 1) Clear all Cache Storage entries (PWA / fetch caches)
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // 2) Unregister any obsolete service workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    // 3) Drop stale offline transaction queue if it grew too large
    try {
      const queue = localStorage.getItem('offline_tx_queue');
      if (queue && queue.length > 500_000) localStorage.removeItem('offline_tx_queue');
    } catch {}

    localStorage.setItem(KEY, APP_VERSION);
  } catch (err) {
    console.warn('Cache cleanup skipped:', err);
  }
};
