import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Shield, Award, HeartHandshake } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';

export default function HomePage({ setView, setSelectedCategory, onSelectProduct }) {
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.getProducts({ isBestSeller: 'true', limit: 8 });
        if (res.products && res.products.length > 0) {
          setBestsellers(res.products);
        } else {
          const fallback = await api.getProducts({ limit: 8 });
          setBestsellers(fallback.products || []);
        }
      } catch (err) {
        console.error('Failed to load bestsellers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleCategoryNavigate = (cat) => {
    setSelectedCategory(cat);
    setView('catalogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-neutral-900 text-white flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
            alt="Veloura Luxury Apparel"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-veloura-gold/20 border border-veloura-gold/40 text-veloura-gold text-xs font-semibold uppercase tracking-[0.25em]">
            <Sparkles size={14} />
            <span>The 120-Piece Curated Archive</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight text-white">
            Quiet Luxury, <br />
            <span className="italic font-normal text-veloura-gold">Uncompromising</span> Craft.
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            Elevate your everyday wardrobe with our enduring collection of long-staple Supima cotton, relaxed silks, and structured linens tailored for the discerning family.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleCategoryNavigate('all')}
              className="px-8 py-4 bg-veloura-gold text-veloura-dark font-bold text-xs uppercase tracking-[0.2em] rounded shadow-xl hover:bg-veloura-gold-light transition duration-200 flex items-center gap-2"
            >
              <span>Explore Entire Collection</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleCategoryNavigate('women')}
              className="px-8 py-4 bg-transparent border border-white/60 text-white font-medium text-xs uppercase tracking-[0.2em] rounded hover:bg-white hover:text-veloura-dark transition duration-200"
            >
              Women's New Arrivals
            </button>
          </div>
        </div>
      </section>

      {/* Category Showcase Grid (Men, Women, Kids, Infants) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-veloura-gold font-bold">
            Curated Categories
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-veloura-dark">
            Tailored For Every Stage of Life
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Explore 30 hand-selected designs in each category, crafted with organic fibers and timeless silhouettes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Men */}
          <div
            onClick={() => handleCategoryNavigate('men')}
            className="group relative h-96 rounded-lg overflow-hidden cursor-pointer shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80"
              alt="Men's Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[11px] font-bold text-veloura-gold uppercase tracking-widest">
                30 Garments
              </span>
              <h3 className="font-serif text-2xl font-bold">Men</h3>
              <p className="text-xs text-neutral-300 line-clamp-1">Supima tees, tailored shirts & selvedge denim</p>
              <span className="inline-block pt-2 text-xs font-semibold text-white group-hover:text-veloura-gold transition">
                Explore Men →
              </span>
            </div>
          </div>

          {/* Women */}
          <div
            onClick={() => handleCategoryNavigate('women')}
            className="group relative h-96 rounded-lg overflow-hidden cursor-pointer shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
              alt="Women's Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[11px] font-bold text-veloura-gold uppercase tracking-widest">
                30 Garments
              </span>
              <h3 className="font-serif text-2xl font-bold">Women</h3>
              <p className="text-xs text-neutral-300 line-clamp-1">Flowing dresses, silk blouses & structured blazers</p>
              <span className="inline-block pt-2 text-xs font-semibold text-white group-hover:text-veloura-gold transition">
                Explore Women →
              </span>
            </div>
          </div>

          {/* Kids */}
          <div
            onClick={() => handleCategoryNavigate('kids')}
            className="group relative h-96 rounded-lg overflow-hidden cursor-pointer shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80"
              alt="Kids' Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[11px] font-bold text-veloura-gold uppercase tracking-widest">
                30 Garments
              </span>
              <h3 className="font-serif text-2xl font-bold">Kids</h3>
              <p className="text-xs text-neutral-300 line-clamp-1">Playproof cotton sets, cozy knits & school wear</p>
              <span className="inline-block pt-2 text-xs font-semibold text-white group-hover:text-veloura-gold transition">
                Explore Kids →
              </span>
            </div>
          </div>

          {/* Infants */}
          <div
            onClick={() => handleCategoryNavigate('infants')}
            className="group relative h-96 rounded-lg overflow-hidden cursor-pointer shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80"
              alt="Infants' Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[11px] font-bold text-veloura-gold uppercase tracking-widest">
                30 Garments
              </span>
              <h3 className="font-serif text-2xl font-bold">Infants</h3>
              <p className="text-xs text-neutral-300 line-clamp-1">Pure organic rompers, gentle wraps & sleepwear</p>
              <span className="inline-block pt-2 text-xs font-semibold text-white group-hover:text-veloura-gold transition">
                Explore Infants →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-b border-veloura-sand">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-veloura-gold font-bold">
              Most Coveted
            </p>
            <h2 className="font-serif text-3xl font-bold text-veloura-dark mt-1">
              Curated Bestsellers
            </h2>
          </div>
          <button
            onClick={() => handleCategoryNavigate('all')}
            className="mt-4 sm:mt-0 text-xs font-bold uppercase tracking-widest text-veloura-dark hover:text-veloura-gold transition flex items-center gap-1"
          >
            <span>View All 120 Garments</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestsellers.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Brand Values / Craftsmanship Banner */}
      <section className="bg-veloura-sand/60 py-16 border-y border-veloura-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center text-veloura-gold shadow-sm">
                <Award size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-veloura-dark">
                100% Long-Staple Supima
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                Only the top 1% of world cotton with extra-long fibers for supreme softness and fade resistance.
              </p>
            </div>

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center text-veloura-gold shadow-sm">
                <Shield size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-veloura-dark">
                Authenticated Verification
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                Real cryptographically generated OTP verification and strict Indian mobile number security.
              </p>
            </div>

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center text-veloura-gold shadow-sm">
                <HeartHandshake size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-veloura-dark">
                Razorpay Certified Checkout
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                Server-verified 256-bit encryption for seamless UPI, credit cards, and Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
