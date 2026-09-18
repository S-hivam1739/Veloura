import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export default function Footer({ setView, setSelectedCategory }) {
  const handleCatClick = (cat) => {
    setSelectedCategory(cat);
    setView('catalogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-veloura-dark text-veloura-sand pt-16 pb-12 border-t border-veloura-charcoal">
      {/* Guarantees Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-veloura-charcoal">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-veloura-charcoal rounded-full text-veloura-gold">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Express Delivery</h4>
              <p className="text-xs text-veloura-muted mt-0.5">Complimentary across India over ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-veloura-charcoal rounded-full text-veloura-gold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Verified Security</h4>
              <p className="text-xs text-veloura-muted mt-0.5">OTP-verified profiles & safe checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-veloura-charcoal rounded-full text-veloura-gold">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Razorpay Protected</h4>
              <p className="text-xs text-veloura-muted mt-0.5">UPI, Cards, NetBanking & COD</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-veloura-charcoal rounded-full text-veloura-gold">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">14-Day Returns</h4>
              <p className="text-xs text-veloura-muted mt-0.5">Hassle-free doorstep exchanges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <span className="font-serif text-3xl font-bold tracking-[0.25em] text-white uppercase">
                Veloura
              </span>
              <span className="h-2 w-2 rounded-full bg-veloura-gold ml-2"></span>
            </div>
            <p className="text-sm text-veloura-muted leading-relaxed max-w-sm">
              Veloura represents the quiet elegance of modern luxury. Thoughtfully designed apparel crafted from enduring long-staple Supima cotton, linen blends, and structured silks for the entire family.
            </p>
            <p className="text-xs text-veloura-gold tracking-widest uppercase">
              Curated 120-Garment Heritage Collection
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-veloura-gold mb-4">
              Garments
            </h4>
            <ul className="space-y-2.5 text-sm text-veloura-muted">
              <li>
                <button onClick={() => handleCatClick('men')} className="hover:text-white transition">
                  Men Collection (30)
                </button>
              </li>
              <li>
                <button onClick={() => handleCatClick('women')} className="hover:text-white transition">
                  Women Collection (30)
                </button>
              </li>
              <li>
                <button onClick={() => handleCatClick('kids')} className="hover:text-white transition">
                  Kids Apparel (30)
                </button>
              </li>
              <li>
                <button onClick={() => handleCatClick('infants')} className="hover:text-white transition">
                  Infants & Baby (30)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-veloura-gold mb-4">
              Customer Concierge
            </h4>
            <ul className="space-y-2.5 text-sm text-veloura-muted">
              <li>
                <button onClick={() => setView('orders')} className="hover:text-white transition">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => setView('profile')} className="hover:text-white transition">
                  My Account
                </button>
              </li>
              <li>
                <span className="text-veloura-muted">Size Guide & Fit</span>
              </li>
              <li>
                <span className="text-veloura-muted">Sustainable Fabrics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-veloura-charcoal/60 text-xs text-veloura-muted flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Veloura Fashion Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Encrypted via Razorpay</span>
          <span>•</span>
          <span>Supabase Cloud Database</span>
          <span>•</span>
          <span>Made for India</span>
        </p>
      </div>
    </footer>
  );
}
