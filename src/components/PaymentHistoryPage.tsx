import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Upload, ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface PaymentOrder {
  id: string;
  plan_name: string;
  amount: number;
  duration_days: number;
  proof_url: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  verified_at: string | null;
}

const PaymentHistoryPage = () => {
  const { setCurrentPage, user } = useApp();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOrders((data || []) as unknown as PaymentOrder[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const statusBadge = (status: string) => {
    if (status === 'pending') return { color: 'bg-topup-soft text-topup', icon: <Clock className="w-3 h-3" />, label: 'Menunggu' };
    if (status === 'approved') return { color: 'bg-setor-soft text-setor', icon: <CheckCircle className="w-3 h-3" />, label: 'Disetujui' };
    return { color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-3 h-3" />, label: 'Ditolak' };
  };

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-3">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl font-black text-primary-foreground">Riwayat Pembayaran</h1>
        <p className="text-primary-foreground/60 text-xs mt-1">Semua pesanan upgrade premium Anda</p>
      </div>

      <div className="px-4 -mt-5 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Memuat...</div>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 shadow-card text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada riwayat pembayaran</p>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="mt-4 px-6 py-2 gradient-primary text-primary-foreground font-bold rounded-xl text-xs"
            >
              Lihat Paket Premium
            </button>
          </div>
        ) : orders.map(order => {
          const badge = statusBadge(order.status);
          return (
            <div key={order.id} className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-foreground">{order.plan_name}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${badge.color}`}>
                  {badge.icon} {badge.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Rp {Number(order.amount).toLocaleString('id-ID')}</span>
                <span className="text-muted-foreground">{order.duration_days} hari</span>
              </div>

              <p className="text-[10px] text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              {order.proof_url && (
                <p className="text-[10px] text-setor font-medium flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Bukti transfer sudah diunggah
                </p>
              )}

              {!order.proof_url && order.status === 'pending' && (
                <button
                  onClick={() => setCurrentPage('payment')}
                  className="text-[10px] text-primary font-bold flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload bukti transfer
                </button>
              )}

              {order.admin_note && order.status === 'rejected' && (
                <p className="text-[10px] text-destructive">Alasan: {order.admin_note}</p>
              )}

              {order.status === 'approved' && order.verified_at && (
                <p className="text-[10px] text-setor">
                  Disetujui: {new Date(order.verified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
