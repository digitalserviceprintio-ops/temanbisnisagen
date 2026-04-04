import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminPaymentNotifications = (isAdmin: boolean, userId: string | undefined) => {
  useEffect(() => {
    if (!isAdmin || !userId) return;

    const channel = supabase
      .channel('admin-payment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_orders',
        },
        (payload) => {
          const order = payload.new as any;
          toast.info('💰 Pembayaran Baru Masuk!', {
            description: `${order.plan_name} - Rp ${Number(order.amount).toLocaleString('id-ID')} dari ${order.user_email}`,
            duration: 10000,
            action: {
              label: 'Lihat',
              onClick: () => {
                // Will be handled by the component that uses this hook
                window.dispatchEvent(new CustomEvent('navigate-to-payment-management'));
              },
            },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_orders',
          filter: `status=eq.pending`,
        },
        (payload) => {
          const order = payload.new as any;
          if (order.proof_url && !payload.old?.proof_url) {
            toast.info('📸 Bukti Transfer Diunggah!', {
              description: `${order.user_email} mengunggah bukti transfer untuk ${order.plan_name}`,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, userId]);
};
