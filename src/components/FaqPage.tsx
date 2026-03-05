import React from 'react';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const faqs = [
  { q: 'Apa itu Teman Agen Bisnis?', a: 'Teman Agen Bisnis adalah aplikasi pencatatan transaksi untuk agen branchless banking. Digunakan untuk mencatat tarik tunai, setor tunai, transfer, dan top up saldo.' },
  { q: 'Bagaimana cara memulai shift?', a: 'Setelah login, Anda akan diarahkan ke halaman Buka Toko. Masukkan saldo kas laci dan saldo bank awal, lalu tekan "Mulai Shift".' },
  { q: 'Bagaimana biaya admin dihitung?', a: 'Biaya admin dihitung berdasarkan kelipatan nominal transaksi. Anda bisa mengatur biaya dan kelipatan di menu Akun → Atur Biaya Admin.' },
  { q: 'Bagaimana cara menutup shift?', a: 'Buka menu Akun → Tutup Shift. Anda akan melihat ringkasan transaksi dan selisih saldo hari ini.' },
  { q: 'Apakah data transaksi tersimpan?', a: 'Ya, semua data transaksi, pengaturan admin, dan status shift tersimpan secara permanen di cloud.' },
  { q: 'Bagaimana cara export laporan?', a: 'Buka menu Laporan, lalu tekan tombol "Excel (CSV)" untuk mengunduh laporan dalam format CSV.' },
  { q: 'Bagaimana menghubungi helpdesk?', a: 'Buka menu Akun → Hubungi Helpdesk, Anda akan diarahkan ke WhatsApp helpdesk kami.' },
];

const FaqPage = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="mb-4 p-2 bg-primary-foreground/20 rounded-full">
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-xl font-black text-primary-foreground">FAQ</h1>
        </div>
        <p className="text-primary-foreground/60 text-xs mt-2">Pertanyaan yang sering diajukan</p>
      </div>

      <div className="px-6 mt-6 space-y-3">
        {faqs.map((faq, i) => (
          <Collapsible key={i}>
            <CollapsibleTrigger className="w-full bg-card rounded-2xl p-4 text-left border border-border shadow-card">
              <p className="text-sm font-bold text-foreground pr-6">{faq.q}</p>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-muted rounded-2xl p-4 mt-1 mx-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
