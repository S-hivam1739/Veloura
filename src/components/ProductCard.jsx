import React from 'react';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelect }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0]?.name || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group bg-white rounded-lg overflow-hidden border border-veloura-sand/80 hover:border-veloura-gold/60 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] bg-veloura-sand/30 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="bg-veloura-dark text-veloura-gold text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow-sm border border-veloura-gold/40">
              Bestseller
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-red-700 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick Add overlay button */}
        <button
          onClick={handleQuickAdd}
          disabled={!product.inStock}
          className="absolute bottom-3 right-3 bg-white/95 text-veloura-dark hover:bg-veloura-dark hover:text-white p-2.5 rounded-full shadow-md transition-all duration-200 opacity-90 group-hover:opacity-100 group-hover:scale-105 disabled:opacity-50"
          title={product.inStock ? "Quick Add to Bag" : "Out of Stock"}
        >
          <ShoppingBag size={18} />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-800 bg-white px-3 py-1.5 border border-neutral-300 rounded shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-veloura-muted uppercase tracking-wider mb-1">
            <span>{product.category} • {product.subcategory}</span>
            <div className="flex items-center gap-1 text-amber-500 font-medium">
              <Star size={12} fill="currentColor" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="font-serif text-sm font-semibold text-veloura-dark line-clamp-1 group-hover:text-veloura-gold-dark transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2 border-t border-veloura-sand/50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-veloura-dark">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-veloura-muted line-through">
                ₹{Number(product.originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <span className="text-[11px] text-veloura-gold font-medium uppercase tracking-wider">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}
