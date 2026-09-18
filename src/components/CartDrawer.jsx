import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onCheckout, onViewCatalogue }) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    tax,
    totalAmount,
    cartCount,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 999;
  const difference = freeShippingThreshold - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-veloura-sand flex items-center justify-between bg-veloura-cream">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-veloura-gold" />
              <h2 className="font-serif text-lg font-bold text-veloura-dark uppercase tracking-wider">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-veloura-dark transition rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-veloura-sand/40 border-b border-veloura-sand/60">
            {difference > 0 ? (
              <p className="text-xs text-neutral-600 mb-1.5 font-medium">
                Add <span className="font-bold text-veloura-dark">₹{difference}</span> more for <span className="text-veloura-gold font-bold">FREE Express Delivery</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-bold mb-1.5 flex items-center gap-1">
                🎉 Congratulations! You have unlocked FREE Express Delivery across India.
              </p>
            )}
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-veloura-gold transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-veloura-sand rounded-full text-veloura-gold">
                  <ShoppingBag size={36} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-veloura-dark">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Discover our curated 120-garment collection of luxury essentials for Men, Women, Kids, and Infants.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onViewCatalogue();
                  }}
                  className="mt-2 px-6 py-2.5 bg-veloura-dark text-white text-xs uppercase font-bold tracking-widest rounded hover:bg-veloura-charcoal transition"
                >
                  Explore Catalogue
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4 p-3 bg-veloura-cream/50 rounded-lg border border-veloura-sand/60"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded bg-veloura-sand/30 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-veloura-dark line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="text-gray-400 hover:text-red-500 transition ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Size: <span className="font-medium text-neutral-800">{item.size}</span> | Color: <span className="font-medium text-neutral-800">{item.color}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-veloura-dark transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-semibold text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-veloura-dark transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-veloura-dark">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-veloura-sand bg-veloura-cream space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-neutral-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (5%)</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-bold text-veloura-dark">
                  <span>Total Amount</span>
                  <span className="text-base text-veloura-dark">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-[0.2em] rounded shadow-md hover:bg-veloura-charcoal transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                Secure checkout powered by Razorpay • Taxes included
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
