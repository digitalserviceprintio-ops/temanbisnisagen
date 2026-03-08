import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, CheckCircle, Clock, AlertCircle, Copy, Check, ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

const BANK_INFO = {
  bank: 'Bank BCA Digital',
  account: '000919213530',
  name: 'Delva Andriawan',
};

const PLANS = [
  { name: 'Premium 90', price: 50000, duration: 90, label: 'Rp 50.000 / 90 hari' },
  { name: 'Premium 365', price: 150000, duration: 365, label: 'Rp 150.000 / 365 hari' },
];

interface PaymentOrder {
  id: string;
  plan_name: string;
  amount: number;
  duration_days: number;
  status: string;
  proof_url: string | null;
  created_at: string;
  admin_note: string;
}

const PaymentPage = () => {
  const { user, setCurrentPage, userEmail, refreshLicense } = useApp();
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [step, setStep] = useState<'select' | 'transfer' | 'upload' | 'done'>('select');
  const [uploading, setUploading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [existingOrders, setExistingOrders] = useState<PaymentOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    const { data } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setExistingOrders((data || []) as unknown as PaymentOrder[]);
    setLoadingOrders(false);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_INFO.account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateOrder = async () => {
    if (!user) return;
    setError('');
    const plan = PLANS[selectedPlan];
    const { data, error: err } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        user_email: userEmail,
        plan_name: plan.name,
        amount: plan.price,
        duration_days: plan.duration,
      } as any)
      .select('id')
      .single();

    if (err) {
      setError('Gagal membuat pesanan. Coba lagi.');
      return;
    }
    setOrderId((data as any).id);
    setStep('transfer');
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !orderId) return;

    setUploading(true);
    setError('');

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${orderId}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('payment-proofs')
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setError('Gagal upload bukti. Coba lagi.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(path);

    const { error: updateErr } = await supabase
      .from('payment_orders')
      .update({ proof_url: urlData.publicUrl } as any)
      .eq('id', orderId);

    if (updateErr) {
      setError('Gagal menyimpan bukti.');
      setUploading(false);
      return;
    }

    setUploading(false);
    setStep('done');
    loadOrders();
  };

  const statusBadge = (status: string) => {
    if (status === 'pending') return { color: 'bg-topup-soft text-topup', label: 'Menunggu Verifikasi' };
    if (status === 'approved') return { color: 'bg-setor-soft text-setor', label: 'Disetujui ✓' };
    if (status === 'rejected') return { color: 'bg-destructive/10 text-destructive', label: 'Ditolak' };
    return { color: 'bg-muted text-muted-foreground', label: status };
  };

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-10 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('pricing')} className="mb-4 flex items-center gap-1 text-primary-foreground/70 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl font-black text-primary-foreground">Pembayaran</h1>
        <p className="text-primary-foreground/60 text-xs mt-1">Transfer & upload bukti untuk aktivasi otomatis</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Step: Select Plan */}
        {step === 'select' && (
          <>
            <div className="bg-card rounded-3xl p-5 shadow-elevated space-y-4">
              <p className="text-sm font-black text-foreground">Pilih Paket</p>
              {PLANS.map((plan, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPlan(i)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedPlan === i
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-secondary/50'
                  }`}
                >
                  <p className="text-sm font-black text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.label}</p>
                </button>
              ))}
              <button
                onClick={handleCreateOrder}
                className="w-full py-3 gradient-primary text-primary-foreground font-bold rounded-xl active:scale-[0.98] transition-transform"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </>
        )}

        {/* Step: Transfer Info */}
        {step === 'transfer' && (
          <div className="bg-card rounded-3xl p-5 shadow-elevated space-y-4">
            <p className="text-sm font-black text-foreground">Transfer ke Rekening Berikut</p>

            <div className="bg-secondary rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Bank</p>
                <p className="text-sm font-black text-foreground">{BANK_INFO.bank}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Nomor Rekening</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono font-black text-foreground tracking-wider">{BANK_INFO.account}</p>
                  <button onClick={handleCopyAccount} className="p-1.5 rounded-lg bg-card border border-border">
                    {copied ? <Check className="w-3.5 h-3.5 text-setor" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Atas Nama</p>
                <p className="text-sm font-black text-foreground">{BANK_INFO.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Jumlah Transfer</p>
                <p className="text-xl font-black text-primary">
                  Rp {PLANS[selectedPlan].price.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="bg-topup-soft rounded-2xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-topup flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-topup font-medium">
                Pastikan nominal transfer sesuai. Setelah transfer, upload bukti pembayaran di langkah berikutnya.
              </p>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="w-full py-3 gradient-primary text-primary-foreground font-bold rounded-xl active:scale-[0.98] transition-transform"
            >
              Sudah Transfer → Upload Bukti
            </button>
          </div>
        )}

        {/* Step: Upload Proof */}
        {step === 'upload' && (
          <div className="bg-card rounded-3xl p-5 shadow-elevated space-y-4">
            <p className="text-sm font-black text-foreground">Upload Bukti Transfer</p>
            <p className="text-xs text-muted-foreground">Foto atau screenshot bukti transfer Anda</p>

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors">
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">
                  {uploading ? 'Mengupload...' : 'Tap untuk pilih foto'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, atau PDF (maks 5MB)</p>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleUploadProof}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="bg-card rounded-3xl p-6 shadow-elevated text-center space-y-4">
            <div className="w-16 h-16 bg-setor-soft rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-setor" />
            </div>
            <h2 className="text-lg font-black text-foreground">Bukti Terkirim!</h2>
            <p className="text-xs text-muted-foreground">
              Pembayaran Anda sedang diverifikasi. Lisensi akan otomatis aktif setelah admin mengkonfirmasi pembayaran.
            </p>
            <p className="text-[10px] text-muted-foreground">
              Estimasi waktu: 5 menit - 1 jam pada jam kerja
            </p>
            <button
              onClick={() => { setStep('select'); setOrderId(null); loadOrders(); }}
              className="w-full py-3 bg-secondary text-foreground font-bold rounded-xl"
            >
              Kembali
            </button>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 rounded-2xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-xs text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Existing orders */}
        {!loadingOrders && existingOrders.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider px-1">Riwayat Pesanan</p>
            {existingOrders.map(order => {
              const badge = statusBadge(order.status);
              return (
                <div key={order.id} className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{order.plan_name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Rp {Number(order.amount).toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {order.proof_url && (
                    <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                      <ImageIcon className="w-3 h-3" /> Bukti transfer sudah diupload
                    </div>
                  )}
                  {order.status === 'approved' && (
                    <button
                      onClick={async () => { await refreshLicense(); setCurrentPage('dashboard'); }}
                      className="w-full py-2 bg-setor text-white font-bold rounded-xl text-xs"
                    >
                      Lisensi Aktif → Masuk Aplikasi
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
