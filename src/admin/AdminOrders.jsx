import React, { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import { adminApi } from '../utils/api';

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getOrders({ status: statusFilter, limit: 100 });
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {['all', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition ${
              statusFilter === s
                ? 'bg-veloura-dark text-white border-veloura-dark'
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-veloura-gold'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="bg-white border border-veloura-sand rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500 flex flex-col items-center gap-2">
            <Package size={28} className="text-neutral-300" />
            No orders found.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <div key={order.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="font-bold text-neutral-900 text-sm">#{order.id}</span>
                    <span className="text-neutral-400 text-xs ml-2">
                      {new Date(order.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
                  <div>
                    <p className="text-neutral-400 uppercase text-[10px] tracking-wider mb-0.5">Customer</p>
                    <p className="font-medium text-neutral-800">{order.customer_name}</p>
                    <p>{order.customer_email}</p>
                    <p>+91 {order.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 uppercase text-[10px] tracking-wider mb-0.5">Items</p>
                    <p>{(order.items || []).length} item(s)</p>
                    <p className="font-bold text-neutral-900 text-sm mt-1">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400 uppercase text-[10px] tracking-wider mb-0.5">Payment</p>
                    <p className="capitalize">{order.payment_method}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="text-[11px] text-neutral-500 uppercase tracking-wider">Order Status:</label>
                  <select
                    value={order.order_status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-veloura-gold disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  {updatingId === order.id && <Loader2 size={14} className="animate-spin text-neutral-400" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}