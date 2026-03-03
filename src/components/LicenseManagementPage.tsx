import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Copy, Trash2, Ban, KeyRound, Check } from 'lucide-react';
import { fetchAllLicenses, createLicense, revokeLicense, deleteLicense, type LicenseRow } from '@/lib/license-data';
import { useApp } from '@/context/AppContext';

const LicenseManagementPage = () => {
  const { setCurrentPage, user } = useApp();
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllLicenses();
    setLicenses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const key = await createLicense(duration, note, user.id);
    setCreating(false);
    if (key) {
      setShowCreate(false);
      setNote('');
      setDuration(30);
      load();
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Cabut lisensi ini?')) return;
    await revokeLicense(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus lisensi ini secara permanen?')) return;
    await deleteLicense(id);
    load();
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-setor-soft text-setor';
    if (s === 'unused') return 'bg-transfer-soft text-transfer';
    return 'bg-destructive/10 text-destructive';
  };

  const statusLabel = (s: string) => {
    if (s === 'active') return 'Aktif';
    if (s === 'unused') return 'Belum Dipakai';
    return 'Dicabut';
  };

  return (
    <div className="pb-24">
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-3">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-primary-foreground">Kelola Lisensi</h1>
          <button onClick={() => setShowCreate(true)} className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-5 space-y-3">
        {/* Create form */}
        {showCreate && (
          <div className="bg-card rounded-3xl p-5 shadow-elevated space-y-3">
            <p className="text-sm font-bold text-foreground">Buat Lisensi Baru</p>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Durasi (hari)</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={1}
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Catatan (opsional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Misal: Untuk Agen Budi"
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 bg-secondary text-foreground rounded-xl text-sm font-bold">Batal</button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 py-2 gradient-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50">
                {creating ? 'Membuat...' : 'Buat'}
              </button>
            </div>
          </div>
        )}

        {/* License list */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Memuat...</div>
        ) : licenses.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 shadow-card text-center space-y-2">
            <KeyRound className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Belum ada lisensi. Klik + untuk membuat.</p>
          </div>
        ) : licenses.map(lic => (
          <div key={lic.id} className="bg-card rounded-2xl p-4 shadow-card border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-foreground tracking-wider">{lic.license_key}</span>
              <button onClick={() => handleCopy(lic.license_key)} className="p-1.5 rounded-lg bg-secondary">
                {copiedKey === lic.license_key ? <Check className="w-3.5 h-3.5 text-setor" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor(lic.status)}`}>
                {statusLabel(lic.status)}
              </span>
              <span className="text-[10px] text-muted-foreground">{lic.duration_days} hari</span>
              {lic.note && <span className="text-[10px] text-muted-foreground">· {lic.note}</span>}
            </div>
            {lic.user_email && (
              <p className="text-[10px] text-muted-foreground">Dipakai oleh: {lic.user_email}</p>
            )}
            {lic.expires_at && (
              <p className="text-[10px] text-muted-foreground">
                Berlaku sampai: {new Date(lic.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              {lic.status === 'active' && (
                <button onClick={() => handleRevoke(lic.id)} className="flex items-center gap-1 text-[10px] font-bold text-destructive">
                  <Ban className="w-3 h-3" /> Cabut
                </button>
              )}
              {lic.status !== 'active' && (
                <button onClick={() => handleDelete(lic.id)} className="flex items-center gap-1 text-[10px] font-bold text-destructive">
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LicenseManagementPage;
