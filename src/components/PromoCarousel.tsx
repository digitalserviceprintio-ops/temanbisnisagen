import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ExternalLink } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

const promoSlides = [
  {
    title: 'Livin\' by Mandiri',
    desc: 'Download & pakai kode referral: MGM7MLZ6LS',
    cta: 'Download Sekarang',
    url: 'https://bmri.id/reflivin?af_adset=MGM7MLZ6LS&deep_link_sub1=null&deep_link_sub2=MGM7MLZ6LS',
    gradient: 'from-[hsl(221,83%,53%)] to-[hsl(250,83%,60%)]',
    badge: 'PROMO',
  },
  {
    title: 'Gabung Mandiri Agen',
    desc: 'Jadilah agen Mandiri dan raih penghasilan tambahan!',
    cta: 'Daftar Sekarang',
    url: 'https://bit.ly/join-mandiriagen',
    gradient: 'from-[hsl(142,71%,45%)] to-[hsl(160,84%,39%)]',
    badge: 'INFO',
  },
  {
    title: 'Berizin & Diawasi OJK',
    desc: 'Bank Mandiri peserta penjaminan LPS. FAQ: bmri.id/livinmgm',
    cta: 'Lihat FAQ',
    url: 'https://bmri.id/livinmgm',
    gradient: 'from-[hsl(25,95%,53%)] to-[hsl(35,95%,50%)]',
    badge: 'RESMI',
  },
];

const PromoCarousel = () => {
  return (
    <div className="px-6 mt-5">
      <Carousel
        opts={{ loop: true, align: 'start' }}
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
      >
        <CarouselContent className="-ml-3">
          {promoSlides.map((slide, i) => (
            <CarouselItem key={i} className="pl-3 basis-[92%]">
              <button
                onClick={() => window.open(slide.url, '_blank')}
                className={`w-full rounded-2xl bg-gradient-to-r ${slide.gradient} p-5 text-left active:scale-[0.98] transition-transform`}
              >
                <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full mb-2">
                  {slide.badge}
                </span>
                <h3 className="text-white font-black text-base leading-tight">{slide.title}</h3>
                <p className="text-white/80 text-[11px] mt-1 leading-snug">{slide.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-white text-[10px] font-bold uppercase tracking-widest">
                  {slide.cta} <ExternalLink className="w-3 h-3" />
                </div>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default PromoCarousel;
