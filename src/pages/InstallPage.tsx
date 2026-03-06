import { ArrowLeft, Download, MoreVertical, Share, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoTba from '@/assets/logo-tba.png';

const InstallPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground p-6 pb-10 rounded-b-3xl">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary-foreground/80 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Kembali</span>
        </button>
        <div className="flex items-center gap-4">
          <img src={logoTba} alt="TBA Logo" className="w-16 h-16 rounded-2xl shadow-lg bg-white/10 p-1" />
          <div>
            <h1 className="text-xl font-black">Install Aplikasi</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Pasang di HP Android Anda</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4">
        {/* Benefit card */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Kenapa Install?
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              Akses cepat dari layar utama HP
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              Tampilan fullscreen seperti aplikasi native
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              Bisa digunakan saat offline
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              Tidak perlu download dari Play Store
            </li>
          </ul>
        </div>

        {/* Chrome steps */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-bold text-foreground mb-4">📱 Cara Install via Chrome</h2>
          <div className="space-y-4">
            <Step number={1} title="Buka di Chrome">
              Buka aplikasi <strong>Teman Bisnis Agen</strong> menggunakan browser <strong>Google Chrome</strong> di HP Android.
            </Step>
            <Step number={2} title="Ketuk Menu ⋮">
              <span className="flex items-center gap-1 flex-wrap">
                Ketuk ikon titik tiga <MoreVertical className="w-4 h-4 inline text-primary" /> di pojok kanan atas browser Chrome.
              </span>
            </Step>
            <Step number={3} title='Pilih "Install Aplikasi"'>
              Pada menu yang muncul, pilih opsi <strong>"Install aplikasi"</strong> atau <strong>"Tambahkan ke Layar utama"</strong>.
            </Step>
            <Step number={4} title="Konfirmasi Install">
              Ketuk <strong>"Install"</strong> pada popup konfirmasi. Ikon aplikasi akan muncul di layar utama HP Anda.
            </Step>
            <Step number={5} title="Selesai!">
              Buka aplikasi dari ikon di layar utama. Sekarang Anda bisa menggunakannya seperti aplikasi biasa!
            </Step>
          </div>
        </div>

        {/* Samsung Internet steps */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-bold text-foreground mb-4">🌐 Cara Install via Samsung Internet</h2>
          <div className="space-y-4">
            <Step number={1} title="Buka di Samsung Internet">
              Buka aplikasi <strong>Teman Bisnis Agen</strong> menggunakan browser <strong>Samsung Internet</strong>.
            </Step>
            <Step number={2} title="Ketuk Menu">
              <span className="flex items-center gap-1 flex-wrap">
                Ketuk ikon menu <Share className="w-4 h-4 inline text-primary" /> atau <MoreVertical className="w-4 h-4 inline text-primary" /> di bawah layar.
              </span>
            </Step>
            <Step number={3} title='Pilih "Tambah ke Layar utama"'>
              <span className="flex items-center gap-1 flex-wrap">
                Pilih <Plus className="w-4 h-4 inline text-primary" /> <strong>"Tambahkan ke Layar utama"</strong>.
              </span>
            </Step>
            <Step number={4} title="Selesai!">
              Konfirmasi dan ikon aplikasi akan tersedia di layar utama HP Anda.
            </Step>
          </div>
        </div>

        {/* Help note */}
        <div className="bg-muted rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 Pastikan Anda menggunakan browser <strong>Chrome</strong> atau <strong>Samsung Internet</strong> versi terbaru untuk pengalaman terbaik.
          </p>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
  <div className="flex gap-3">
    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
      {number}
    </div>
    <div>
      <h3 className="font-bold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{children}</p>
    </div>
  </div>
);

export default InstallPage;
