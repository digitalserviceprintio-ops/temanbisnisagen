import React from 'react';
import { ArrowLeft, Check, Crown, Zap, Rocket, MessageCircle, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const plans = [
  {
    name: 'Gratis',
    price: 'Rp 0',
    duration: '30 hari',
    desc: 'Cocok untuk mencoba semua fitur dasar',
    icon: <Zap className="w-6 h-6" />,
    colorClass: 'bg-muted text-muted-foreground',
    borderClass: 'border-border',
    badgeClass: '',
    popular: false,
    features: [
      'Catat transaksi Tarik, Setor, Transfer',
      'Buku kas harian',
      'Laporan shift harian',
      'Top up saldo kas & bank',
      'Tutup shift & ringkasan',
      'Profil toko dasar',
    ],
    limitations: [
      'Masa aktif hanya 30 hari',
      'Tanpa laporan bulanan',
      'Tanpa dukungan prioritas',
    ],
  },
  {
    name: 'Premium 90',
    price: 'Rp 50.000',
    duration: '90 hari',
    desc: 'Pilihan hemat untuk agen aktif',
    icon: <Crown className="w-6 h-6" />,
    colorClass: 'gradient-primary text-primary-foreground',
    borderClass: 'border-primary/40 ring-2 ring-primary/20',
    badgeClass: 'bg-primary text-primary-foreground',
    popular: true,
    features: [
      'Semua fitur paket Gratis',
      'Laporan bulanan lengkap',
      'Atur biaya admin kustom',
      'Cetak/bagikan struk transaksi',
      'Dukungan WhatsApp prioritas',
      'Offline mode & sinkronisasi',
    ],
    limitations: [],
  },
  {
    name: 'Premium 365',
    price: 'Rp 150.000',
    duration: '365 hari',
    desc: 'Nilai terbaik untuk jangka panjang',
    icon: <Rocket className="w-6 h-6" />,
    colorClass: 'bg-setor text-setor-foreground',
    borderClass: 'border-setor/40',
    badgeClass: 'bg-setor text-white',
    popular: false,
    features: [
      'Semua fitur Premium 90',
      'Hemat 17% dibanding 90 hari',
      'Akses fitur baru lebih awal',
      'Dukungan prioritas tertinggi',
      'Backup data otomatis',
      'Multi-device support',
    ],
    limitations: [],
  },
];

const PricingPage = () => {
  const { setCurrentPage } = useApp();

  const handleOrder = (planName: string) => {
    const msg = encodeURIComponent(`Halo, saya ingin memesan paket ${planName} Teman Bisnis Agen`);
    window.open(`https://wa.me/6282186371356?text=${msg}`, '_blank');
  };

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-10 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="mb-4 flex items-center gap-1 text-primary-foreground/70 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl font-black text-primary-foreground">Pilih Paket</h1>
        <p className="text-primary-foreground/60 text-xs mt-1">Upgrade untuk akses fitur lengkap tanpa batas</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {plans.map((plan, i) => (
          <div key={i} className={`bg-card rounded-3xl p-5 shadow-elevated border relative ${plan.borderClass}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${plan.badgeClass}`}>
                  <Star className="w-3 h-3" /> Paling Populer
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.colorClass}`}>
                {plan.icon}
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">{plan.name}</h3>
                <p className="text-[10px] text-muted-foreground">{plan.desc}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-black text-foreground">{plan.price}</span>
              <span className="text-xs text-muted-foreground ml-1">/ {plan.duration}</span>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((f, j) => (
                <div key={j} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-setor flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground">{f}</span>
                </div>
              ))}
              {plan.limitations.map((l, j) => (
                <div key={j} className="flex items-start gap-2 opacity-50">
                  <span className="w-4 h-4 flex items-center justify-center text-destructive flex-shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span className="text-xs text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>

            {i === 0 ? (
              <div className="w-full py-3 bg-secondary text-muted-foreground font-bold rounded-xl text-center text-sm">
                Paket Saat Ini
              </div>
            ) : (
              <button
                onClick={() => handleOrder(plan.name)}
                className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${plan.popular ? 'gradient-primary text-primary-foreground' : 'bg-setor text-white'}`}
              >
                <MessageCircle className="w-4 h-4" />
                Pesan via WhatsApp
              </button>
            )}
          </div>
        ))}

        <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground text-center">
            💡 Pembayaran via transfer bank. Setelah konfirmasi, lisensi langsung aktif dalam hitungan menit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
