import { useEffect, useRef } from 'react';
import type { PageId } from '@/types/app';

/** Which page the device/browser back button should return to. */
const PARENT_PAGE: Partial<Record<PageId, PageId>> = {
  cashbook: 'dashboard',
  report: 'dashboard',
  account: 'dashboard',
  'admin-settings': 'account',
  faq: 'account',
  'license-management': 'account',
  'payment-management': 'account',
  'payment-stats': 'account',
  'payment-history': 'account',
  pricing: 'account',
  payment: 'pricing',
  'monthly-report': 'report',
};

/**
 * Makes the device / browser back button work with the in-app page state.
 * Priority: close an open modal first, then navigate to the parent page.
 */
export const useBackNavigation = (
  currentPage: PageId,
  setCurrentPage: (page: PageId) => void,
  closeTopOverlay: () => boolean,
) => {
  const pageRef = useRef(currentPage);
  const closeRef = useRef(closeTopOverlay);
  pageRef.current = currentPage;
  closeRef.current = closeTopOverlay;

  useEffect(() => {
    // Seed one extra history entry so the first back press is captured.
    window.history.pushState({ tba: true }, '');

    const onPopState = () => {
      // Always keep a spare entry so the app is never popped off accidentally.
      window.history.pushState({ tba: true }, '');

      if (closeRef.current()) return;

      const parent = PARENT_PAGE[pageRef.current];
      if (parent) setCurrentPage(parent);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setCurrentPage]);
};
