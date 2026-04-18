import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, ShoppingBag, CheckCircle2, Clock, XCircle, Wallet, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/format';

interface PaymentOrderRow {
  id: string;
  user_id: string;
  user_email: string;
  plan_name: string;
  amount: number;
  duration_days: number;
  status: string;
  created_at: string;
  verified_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'hsl(142, 71%, 45%)',
  pending: 'hsl(38, 92%, 50%)',
  rejected: 'hsl(0, 84%, 60%)',
};

const PLAN_COLORS = ['hsl(25, 95%, 53%)', 'hsl(221, 83%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(280, 70%, 55%)'];

const PaymentStatsPage = () => {
  const { setCurrentPage } = useApp();
  const [orders, setOrders] = useState<PaymentOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'30d' | '90d' | '365d' | 'all'>('90d');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_orders')
        .select('id, user_id, user_email, plan_name, amount, duration_days, status, created_at, verified_at')
        .order('created_at', { ascending: false });
      if (!error) setOrders((data || []) as PaymentOrderRow[]);
      setLoading(false);
    };
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    if (range === 'all') return orders;
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return orders.filter(o => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, range]);

  const stats = useMemo(() => {
    const approved = filteredOrders.filter(o => o.status === 'approved');
    const pending = filteredOrders.filter(o => o.status === 'pending');
    const rejected = filteredOrders.filter(o => o.status === 'rejected');
    const totalRevenue = approved.reduce((sum, o) => sum + Number(o.amount), 0);
    const uniqueCustomers = new Set(approved.map(o => o.user_id)).size;
    const avgOrder = approved.length > 0 ? totalRevenue / approved.length : 0;
    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      uniqueCustomers,
      avgOrder,
    };
  }, [filteredOrders]);

  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; orders: number; approved: number }> = {};
    filteredOrders.forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { month: key, revenue: 0, orders: 0, approved: 0 };
      map[key].orders++;
      if (o.status === 'approved') {
        map[key].revenue += Number(o.amount);
        map[key].approved++;
      }
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => {
        const [y, m] = d.month.split('-');
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        return { ...d, label };
      });
  }, [filteredOrders]);

  const planData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.filter(o => o.status === 'approved').forEach(o => {
      map[o.plan_name] = (map[o.plan_name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const statusData = useMemo(() => [
    { name: 'Approved', value: stats.approvedCount, color: STATUS_COLORS.approved },
    { name: 'Pending', value: stats.pendingCount, color: STATUS_COLORS.pending },
    { name: 'Rejected', value: stats.rejectedCount, color: STATUS_COLORS.rejected },
  ].filter(d => d.value > 0), [stats]);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => setCurrentPage('account')} className="mb-4 p-2 bg-primary-foreground/20 rounded-full">
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-xl font-black text-primary-foreground">Statistik Pembayaran</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {([
            { k: '30d', l: '30 Hari' },
            { k: '90d', l: '90 Hari' },
            { k: '365d', l: '1 Tahun' },
            { k: 'all', l: 'Semua' },
          ] as const).map(opt => (
            <button
              key={opt.k}
              onClick={() => setRange(opt.k)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                range === opt.k
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-primary-foreground/15 text-primary-foreground'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="px-6 mt-6 space-y-5">
          {/* Highlight Revenue */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-card text-primary-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">Total Pendapatan</p>
            </div>
            <p className="text-3xl font-black">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs mt-2 opacity-80">
              {stats.approvedCount} pesanan disetujui · Rata-rata {formatCurrency(stats.avgOrder)}
            </p>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Total Pesanan" value={stats.totalOrders.toString()} color="bg-primary/10 text-primary" />
            <StatCard icon={<Users className="w-4 h-4" />} label="Pelanggan Unik" value={stats.uniqueCustomers.toString()} color="bg-transfer-soft text-transfer" />
            <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Disetujui" value={stats.approvedCount.toString()} color="bg-setor-soft text-setor" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Pending" value={stats.pendingCount.toString()} color="bg-topup-soft text-topup" />
            <StatCard icon={<XCircle className="w-4 h-4" />} label="Ditolak" value={stats.rejectedCount.toString()} color="bg-tarik-soft text-tarik" />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Konversi"
              value={stats.totalOrders > 0 ? `${Math.round((stats.approvedCount / stats.totalOrders) * 100)}%` : '0%'}
              color="bg-muted text-foreground"
            />
          </div>

          {/* Monthly Revenue Chart */}
          {monthlyData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Pendapatan per Bulan</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Orders Trend */}
          {monthlyData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Jumlah Pesanan per Bulan</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="orders" name="Total" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="approved" name="Disetujui" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Status Pie */}
          {statusData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Distribusi Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Plan Pie */}
          {planData.length > 0 && (
            <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
              <h3 className="font-black text-sm text-foreground mb-4">Paket Terlaris</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {planData.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredOrders.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-sm">Belum ada data pembayaran pada periode ini</p>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color} mb-2`}>{icon}</div>
    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{label}</p>
    <p className="text-lg font-black text-foreground mt-1">{value}</p>
  </div>
);

export default PaymentStatsPage;
