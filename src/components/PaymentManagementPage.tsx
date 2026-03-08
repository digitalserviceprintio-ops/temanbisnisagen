import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface PaymentOrder {
  id: string;
  user_id: string;
  user_email: string;
  plan_name: string;
  amount: number;
  duration_days: number;
  proof_url: string | null;
  status: string;
  admin_note: string;
  created_at: string;
  verified_at: string | null;
}

const PaymentManagementPage = () => {
  const { setCurrentPage, user } = useApp();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('payment_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setOrders((data || []) as unknown as PaymentOrder[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (orderId: string) => {
    if (!user || !window.confirm('Setujui pembayaran ini? Lisensi akan otomatis aktif.')) return;
    setProcessing(orderId);
    const { data, error } = await supabase.rpc('approve_payment', {
      _order_id: orderId,
      _admin_id: user.id,
    });
    setProcessing(null);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      const result = data as unknown as { success: boolean; message: string };
      alert(result.message);
      load();
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = window.prompt('Alasan penolakan (opsional):');
    if (reason === null) return;
    setProcessing(orderId);
    await supabase
      .from('payment_orders')
      .update({ status: 'rejected', admin_note: reason || 'Ditolak', verified_at: new Date().toISOString(), verified_by: user?.id } as any)
      .eq('id', orderId);
    setProcessing(null);
    load();
  };

  const statusBadge = (status: string) => {
    if (status === 'pending') return { color: 'bg-topup-soft text-topup', icon: <Clock className="w-3 h-3" />, label: 'Menunggu' };
    if (status === 'approved') return { color: 'bg-setor-soft text-setor', icon: <CheckCircle className="w-3 h-3" />, label: 'Disetujui' };
    return { color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-3 h-3" />, label: 'Ditolak' };
  };

  const filters = [
    { key: 'pending' as const, label: 'Menunggu' },
    { key: 'approved' as const, label: 'Disetujui' },
    { key: 'rejected' as const, label: 'Ditolak' },
    { key: 'all' as const, label: 'Semua' },
  ];

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-3">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl font-black text-primary-foreground">Verifikasi Pembayaran</h1>
        <p className="text-primary-foreground/60 text-xs mt-1">Setujui pembayaran untuk aktivasi lisensi otomatis</p>
      </div>

      <div className="px-4 -mt-5 space-y-3">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Memuat...</div>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 shadow-card text-center">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tidak ada pesanan {filter !== 'all' ? `dengan status "${filter}"` : ''}</p>
          </div>
        ) : orders.map(order => {
          const badge = statusBadge(order.status);
          return (
            <div key={order.id} className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-foreground">{order.plan_name}</p>
                  <p className="text-[10px] text-muted-foreground">{order.user_email}</p>
                </div>
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
                <button
                  onClick={() => setPreviewImg(order.proof_url)}
                  className="flex items-center gap-1.5 text-xs text-primary font-bold"
                >
                  <Eye className="w-3.5 h-3.5" /> Lihat Bukti Transfer
                </button>
              )}

              {!order.proof_url && order.status === 'pending' && (
                <p className="text-[10px] text-destructive font-medium flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Belum upload bukti transfer
                </p>
              )}

              {order.admin_note && order.status === 'rejected' && (
                <p className="text-[10px] text-destructive">Alasan: {order.admin_note}</p>
              )}

              {order.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(order.id)}
                    disabled={processing === order.id}
                    className="flex-1 py-2 bg-setor text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {processing === order.id ? '...' : 'Setujui'}
                  </button>
                  <button
                    onClick={() => handleReject(order.id)}
                    disabled={processing === order.id}
                    className="flex-1 py-2 bg-destructive/10 text-destructive font-bold rounded-xl text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Tolak
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image preview modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <div className="max-w-sm w-full">
            <img src={previewImg} alt="Bukti Transfer" className="w-full rounded-2xl" />
            <button onClick={() => setPreviewImg(null)} className="w-full mt-3 py-3 bg-card text-foreground font-bold rounded-xl">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagementPage;
