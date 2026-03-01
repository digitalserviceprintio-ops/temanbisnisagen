import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Calendar, TrendingUp, ArrowUpCircle, ArrowDownCircle, Repeat, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction } from '@/types/app';

const COLORS = ['hsl(25, 95%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(221, 83%, 53%)', 'hsl(222, 47%, 11%)'];

const MonthlyReportPage = () => {
  const { user, setCurrentPage } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthlyTxs, setMonthlyTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadMonthly = async () => {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDay = new Date(Number(year), Number(month), 0).getDate();
      const endDate = `${year}-${month}-${String(endDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('timestamp', { ascending: true });

      if (error) { console.error(error); setMonthlyTxs([]); }
      else {
        setMonthlyTxs((data || []).map(row => ({
          id: row.id,
          type: row.type as Transaction['type'],
          amount: Number(row.amount),
          fee: Number(row.fee),
          timestamp: row.timestamp,
          customerName: row.customer_name,
          target: row.target,
          status: row.status as Transaction['status'],
        })));
      }
      setLoading(false);
    };
    loadMonthly();
  }, [user, selectedMonth]);

  const stats = useMemo(() => {
    const result = { tarik: 0, setor: 0, transfer: 0, topup: 0, totalFee: 0, totalVolume: 0, tarikCount: 0, setorCount: 0, transferCount: 0, topupCount: 0 };
    monthlyTxs.forEach(tx => {
      if (tx.type === 'TARIK') { result.tarik += tx.amount; result.tarikCount++; }
      else if (tx.type === 'SETOR') { result.setor += tx.amount; result.setorCount++; }
      else if (tx.type === 'TRANSFER') { result.transfer += tx.amount; result.transferCount++; }
      else { result.topup += tx.amount; result.topupCount++; }
      if (tx.type !== 'TOPUP') { result.totalFee += tx.fee; result.totalVolume += tx.amount; }
    });
    return result;
  }, [monthlyTxs]);

  const dailyChartData = useMemo(() => {
    const map: Record<string, { date: string; fee: number; volume: number; count: number }> = {};
    monthlyTxs.forEach(tx => {
      const day = tx.timestamp.split('T')[0];
      if (!map[day]) map[day] = { date: day, fee: 0, volume: 0, count: 0 };
      if (tx.type !== 'TOPUP') {
        map[day].fee += tx.fee;
        map[day].volume += tx.amount;
      }
      map[day].count++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
      ...d,
      label: new Date(d.date).getDate().toString(),
    }));
  }, [monthlyTxs]);

  const pieData = useMemo(() => [
    { name: 'Tarik', value: stats.tarikCount },
    { name: 'Setor', value: stats.setorCount },
    { name: 'Transfer', value: stats.transferCount },
    { name: 'Top Up', value: stats.topupCount },
  ].filter(d => d.value > 0), [stats]);

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('report')} className="mb-4 p-2 bg-primary-foreground/20 rounded-full">
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-xl font-black text-primary-foreground">Laporan Bulanan</h1>
        </div>

        {/* Month Picker */}
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="px-6 mt-6 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="Total Pendapatan" value={formatCurrency(stats.totalFee)} color="bg-primary/10 text-primary" />
            <SummaryCard icon={<Wallet className="w-4 h-4" />} label="Volume Transaksi" value={formatCurrency(stats.totalVolume)} color="bg-setor-soft text-setor" />
            <SummaryCard icon={<ArrowDownCircle className="w-4 h-4" />} label="Total Tarik" value={`${stats.tarikCount}x · ${formatCurrency(stats.tarik)}`} color="bg-tarik-soft text-tarik" />
            <SummaryCard icon={<ArrowUpCircle className="w-4 h-4" />} label="Total Setor" value={`${stats.setorCount}x · ${formatCurrency(stats.setor)}`} color="bg-setor-soft text-setor" />
            <SummaryCard icon={<Repeat className="w-4 h-4" />} label="Total Transfer" value={`${stats.transferCount}x · ${formatCurrency(stats.transfer)}`} color="bg-transfer-soft text-transfer" />
            <SummaryCard icon={<Wallet className="w-4 h-4" />} label="Total Top Up" value={`${stats.topupCount}x · ${formatCurrency(stats.topup)}`} color="bg-muted text-foreground" />
          </div>

          {/* Revenue Chart */}
          {dailyChartData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Pendapatan Harian (Fee Admin)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={l => `Tanggal ${l}`} />
                  <Bar dataKey="fee" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume Chart */}
          {dailyChartData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Tren Volume Transaksi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={l => `Tanggal ${l}`} />
                  <Line type="monotone" dataKey="volume" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Komposisi Transaksi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Total TRX */}
          <div className="bg-card rounded-3xl p-5 shadow-card border border-border text-center">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total Transaksi {monthLabel}</p>
            <p className="text-3xl font-black text-foreground mt-2">{monthlyTxs.length}</p>
          </div>

          {monthlyTxs.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-sm">Tidak ada transaksi di bulan ini</p>
          )}
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color} mb-2`}>{icon}</div>
    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black text-foreground mt-1 truncate">{value}</p>
  </div>
);

export default MonthlyReportPage;
