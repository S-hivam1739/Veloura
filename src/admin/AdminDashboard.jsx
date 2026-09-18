import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Package, LogOut } from 'lucide-react';
import { adminApi } from '../utils/api';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('products');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => setStats(res.stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="min-h-screen bg-veloura-sand/30">
      {/* Top Bar */}
      <header className="bg-veloura-dark text-white px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-veloura-gold" />
          <span className="font-serif text-lg font-bold tracking-wide">Veloura Admin Panel</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Products" value={stats.totalProducts} />
            <StatCard label="Orders" value={stats.totalOrders} />
            <StatCard label="Customers" value={stats.totalCustomers} />
            <StatCard label="Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-veloura-sand">
          <TabButton active={tab === 'products'} onClick={() => setTab('products')} icon={ShoppingBag} label="Products" />
          <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={Package} label="Orders" />
        </div>

        {tab === 'products' ? <AdminProducts /> : <AdminOrders />}
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-veloura-sand rounded-xl p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="font-serif text-2xl font-bold text-veloura-dark mt-1">{value ?? '—'}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 transition ${
        active ? 'border-veloura-gold text-veloura-dark' : 'border-transparent text-neutral-400 hover:text-neutral-700'
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}