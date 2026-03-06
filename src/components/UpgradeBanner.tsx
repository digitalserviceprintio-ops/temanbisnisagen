import React from 'react';
import { Crown, X, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const UpgradeBanner = () => {
  const { licenseInfo, isAdmin } = useApp();
  const [dismissed, setDismissed] = React.useState(false);

  if (isAdmin || dismissed || !licenseInfo?.valid) return null;

  const daysLeft = licenseInfo.days_remaining ?? 99;
  if (daysLeft > 7) return null;

  const urgent = daysLeft <= 3;

  return (
    <div className={`mx-4 mt-2 p-4 rounded-2xl border shadow-card ${urgent ? 'bg-destructive/10 border-destructive/30' : 'bg-topup-soft border-topup/30'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${urgent ? 'bg-destructive/20' : 'bg-topup/20'}`}>
          <Crown className={`w-5 h-5 ${urgent ? 'text-destructive' : 'text-topup'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground">
            {urgent ? `⚠️ Masa trial habis ${daysLeft} hari lagi!` : `Trial tersisa ${daysLeft} hari`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Upgrade ke Premium untuk akses tanpa batas dan fitur lengkap.
          </p>
          <button
            onClick={() => window.open('https://wa.me/6282186371356?text=Halo%2C%20saya%20ingin%20upgrade%20ke%20Premium%20Teman%20Bisnis%20Agen', '_blank')}
            className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-[0.97] transition-transform ${urgent ? 'bg-destructive text-destructive-foreground' : 'gradient-primary text-primary-foreground'}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Upgrade Premium
          </button>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UpgradeBanner;
