import React, { useState, useEffect } from 'react';
import { X, Store, Save, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const StoreProfileModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { storeProfile, updateStoreProfile } = useApp();
  const [form, setForm] = useState({
    store_name: '',
    owner_name: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeProfile) {
      setForm({
        store_name: storeProfile.store_name,
        owner_name: storeProfile.owner_name,
        address: storeProfile.address,
        phone: storeProfile.phone,
      });
    }
  }, [storeProfile, open]);

  if (!open) return null;

  const onSave = async () => {
    setLoading(true);
    await updateStoreProfile(form);
    setLoading(false);
    onClose();
  };

  const fields = [
    { key: 'store_name', label: 'Nama Toko', placeholder: 'Contoh: Agen BRILink Jaya' },
    { key: 'owner_name', label: 'Nama Pemilik', placeholder: 'Nama lengkap pemilik' },
    { key: 'address', label: 'Alamat Toko', placeholder: 'Alamat lengkap toko' },
    { key: 'phone', label: 'No. HP Toko', placeholder: '08xxxxxxxxxx' },
  ];

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-lg mx-auto rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-foreground">Profil Toko</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-muted rounded-full">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{f.label}</label>
              {f.key === 'address' ? (
                <textarea
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              )}
            </div>
          ))}

          <button onClick={onSave} disabled={loading || !form.store_name}
            className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-elevated disabled:opacity-40 active:scale-[0.98] transition-transform text-sm uppercase tracking-widest mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
              <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan Profil</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreProfileModal;
