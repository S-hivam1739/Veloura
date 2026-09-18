import React, { useState, useEffect } from 'react';
import { User, Package, ShieldCheck, Phone, Mail, Calendar, LogOut, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function ProfilePage({ setView, onViewCatalogue }) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (user?.email) {
        try {
          const res = await api.getMyOrders(user.email);
          setOrders(res.orders || []);
        } catch (err) {
          console.error('Failed to load user orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      } else {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-xl border border-veloura-sand text-center space-y-4 shadow-sm">
        <User size={36} className="mx-auto text-neutral-400" />
        <h2 className="font-serif text-2xl font-bold text-veloura-dark">Please Sign In</h2>
        <p className="text-xs text-neutral-500">
          Sign in to view your account details and order history.
        </p>
        <button
          onClick={() => setView('login')}
          className="px-6 py-2.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-veloura-sand pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-veloura-dark uppercase tracking-wide">
            My Account & Orders
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
            Verified Customer Profile • Real-Time Supabase Sync
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            setView('home');
          }}
          className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider rounded-lg transition flex items-center gap-1.5"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 4 Cols: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-veloura-sand shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-veloura-sand/80 text-veloura-dark flex items-center justify-center font-serif text-2xl font-bold border border-veloura-gold/40">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-veloura-dark">
                  {user.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck size={12} />
                  <span>OTP Verified</span>
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-neutral-400 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-neutral-400 flex-shrink-0" />
                <span>+91 {user.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-neutral-400 flex-shrink-0" />
                <span>Member since {new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="bg-veloura-sand/40 p-5 rounded-xl border border-veloura-sand text-xs text-neutral-600 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-veloura-dark text-[11px]">
              Security Details
            </h4>
            <p className="leading-relaxed">
              Your account is authenticated using cryptographic 6-digit email OTPs and strict Indian mobile validation.
            </p>
          </div>
        </div>

        {/* Right 8 Cols: Order History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-veloura-sand shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <h2 className="font-serif text-xl font-bold text-veloura-dark flex items-center gap-2">
                <Package size={20} className="text-veloura-gold" />
                <span>Order History ({orders.length})</span>
              </h2>
            </div>

            {loadingOrders ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-neutral-100 rounded-lg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Package size={36} className="mx-auto text-neutral-300" />
                <h3 className="font-serif text-base font-bold text-veloura-dark">
                  No orders found
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  You haven't placed any orders yet. Discover our 120 curated garments.
                </p>
                <button
                  onClick={onViewCatalogue}
                  className="mt-2 px-6 py-2.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition space-y-3"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-neutral-200/60 pb-3 text-xs">
                      <div>
                        <span className="font-bold text-neutral-900">#{order.id}</span>
                        <span className="text-neutral-400 ml-2">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.payment_status || 'Pending'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-200 text-neutral-700">
                          {order.order_status || 'Placed'}
                        </span>
                      </div>
                    </div>

                    {/* Order items preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap gap-3 py-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.product_name}
                                className="w-10 h-12 object-cover rounded bg-neutral-200 flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-medium text-neutral-800 line-clamp-1">{item.product_name}</p>
                              <p className="text-[11px] text-neutral-500">
                                Qty: {item.quantity} • ₹{Number(item.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 text-xs border-t border-neutral-200/60">
                      <span className="text-neutral-500 capitalize">
                        Method: {order.payment_method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                      </span>
                      <span className="font-bold text-sm text-neutral-900">
                        Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
