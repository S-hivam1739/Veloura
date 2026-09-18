import React, { useEffect } from 'react';
import { CheckCircle, Package, Truck, Mail, ArrowRight, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderConfirmationPage({ order, onViewOrders, onContinueShopping }) {
  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A880', '#121212', '#E5D5C0', '#2e7d32'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto my-20 p-10 bg-white rounded-xl border border-veloura-sand text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-veloura-dark">No Order Details</h2>
        <button
          onClick={onContinueShopping}
          className="px-6 py-2.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const address = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : order.shipping_address || {};

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl border border-veloura-sand/80 overflow-hidden">
        {/* Top Header */}
        <div className="bg-veloura-cream p-8 text-center border-b border-veloura-sand space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
            <CheckCircle size={36} />
          </div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-veloura-gold block">
            Order Confirmed & Saved in Supabase
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-veloura-dark">
            Thank You, {order.customer_name}!
          </h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Order <strong className="text-neutral-900">#{order.id}</strong> has been successfully placed. A detailed receipt has been sent to <strong className="text-neutral-900">{order.customer_email}</strong>.
          </p>
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Status Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-400 block uppercase text-[10px] font-bold">Order ID</span>
              <span className="font-bold text-neutral-900">{order.id}</span>
            </div>
            <div>
              <span className="text-neutral-400 block uppercase text-[10px] font-bold">Payment Method</span>
              <span className="font-bold text-neutral-900 capitalize">
                {order.payment_method === 'razorpay' ? 'Razorpay (Paid)' : 'Cash on Delivery'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block uppercase text-[10px] font-bold">Payment Status</span>
              <span className={`font-bold uppercase text-[11px] ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.payment_status || 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block uppercase text-[10px] font-bold">Estimated Delivery</span>
              <span className="font-bold text-neutral-900">3 - 5 Business Days</span>
            </div>
          </div>

          {/* Items Purchased */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-veloura-dark border-b border-neutral-100 pb-2">
              Garments Ordered ({items.length})
            </h3>
            <div className="divide-y divide-neutral-100">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name || item.product_name}
                        className="w-16 h-20 object-cover rounded bg-veloura-sand/40 flex-shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-neutral-900 text-sm">
                        {item.name || item.product_name}
                      </h4>
                      <p className="text-neutral-500 mt-1">
                        Size: <span className="text-neutral-800 font-medium">{item.size || 'M'}</span> | Color: <span className="text-neutral-800 font-medium">{item.color || 'Standard'}</span> | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 text-sm">
                    ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-neutral-200">
            {/* Delivery address */}
            <div className="text-xs space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Truck size={14} className="text-veloura-gold" />
                <span>Shipping Address</span>
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                {order.customer_name}<br />
                {address.street || address.address || ''}<br />
                {address.city}, {address.state} - {address.pincode}<br />
                Contact: +91 {order.customer_phone}
              </p>
            </div>

            {/* Financial Summary */}
            <div className="text-xs space-y-2 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-neutral-900">
                  {Number(order.shipping_fee) === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.shipping_fee}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST (5%)</span>
                <span className="font-semibold text-neutral-900">₹{Number(order.tax || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-300 font-bold text-sm text-veloura-dark">
                <span>Total Amount Paid</span>
                <span className="text-base">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={onViewOrders}
              className="px-6 py-3 border border-veloura-dark text-veloura-dark text-xs uppercase font-bold tracking-widest rounded hover:bg-neutral-50 transition"
            >
              View in My Orders
            </button>
            <button
              onClick={onContinueShopping}
              className="px-8 py-3 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded shadow-md hover:bg-veloura-charcoal transition flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
