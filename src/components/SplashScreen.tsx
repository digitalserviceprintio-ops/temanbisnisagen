import { useState, useEffect } from 'react';
import logoTba from '@/assets/logo-tba.png';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1800);
    const finishTimer = setTimeout(() => onFinish(), 2300);
    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="animate-bounce-slow flex flex-col items-center gap-4">
        <img
          src={logoTba}
          alt="Teman Bisnis Agen"
          className="w-28 h-28 rounded-3xl shadow-2xl"
        />
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Teman Bisnis Agen
        </h1>
        <p className="text-white/70 text-sm font-medium">
          Pencatatan transaksi harian agen
        </p>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default SplashScreen;
