import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function ProductDetailsPage({ productId, onBack, onSelectProduct, onBuyNow }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [completeTheLook, setCompleteTheLook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const res = await api.getProductById(productId);
        if (res.product) {
          setProduct(res.product);
          setCompleteTheLook(res.completeTheLook || []);
          setSelectedImage(res.product.image);
          if (res.product.sizes?.length > 0) {
            setSelectedSize(res.product.sizes[0]);
          }
          if (res.product.colors?.length > 0) {
            setSelectedColor(res.product.colors[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-neutral-200 rounded-lg" />
          <div className="space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 rounded w-1/4" />
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-32 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-veloura-dark">Garment Not Found</h2>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleDirectBuy = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    if (onBuyNow) {
      onBuyNow();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Catalogue Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-veloura-dark transition mb-8"
      >
        <ArrowLeft size={16} />
        <span>Return to Catalogue</span>
      </button>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Selected Image */}
          <div className="relative aspect-[3/4] bg-veloura-sand/20 rounded-lg overflow-hidden border border-veloura-sand/80 shadow-md">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-700 text-white text-xs font-bold tracking-wider px-3 py-1 rounded shadow-sm">
                {product.discountPercent}% OFF
              </span>
            )}

            {product.isBestSeller && (
              <span className="absolute top-4 right-4 bg-veloura-dark text-veloura-gold text-xs font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm border border-veloura-gold/40">
                Bestseller
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img
                      ? 'border-veloura-gold scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Specs & Purchase Actions (7 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-veloura-muted uppercase tracking-widest">
              <span>Veloura Archive • {product.category} / {product.subcategory}</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                {product.inStock ? `In Stock (${product.stockQuantity} pieces available)` : 'Sold Out'}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-veloura-dark leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 underline cursor-pointer">
                {product.reviewCount} customer reviews
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-veloura-dark">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-neutral-400 line-through">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-neutral-500">
                Inclusive of all taxes & duties
              </span>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed pt-2 border-t border-veloura-sand/60">
              {product.description}
            </p>

            {/* Color Swatch Picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs uppercase font-bold tracking-wider text-veloura-dark flex items-center justify-between">
                  <span>Color: <span className="text-veloura-gold font-semibold">{selectedColor}</span></span>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedColor === c.name ? 'border-veloura-gold scale-110 shadow-md' : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check size={14} className={c.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs uppercase font-bold tracking-wider text-veloura-dark">
                  <span>Select Size</span>
                  <span className="text-neutral-400 font-normal underline cursor-pointer">True to size</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
                        selectedSize === size
                          ? 'bg-veloura-dark text-veloura-sand border border-veloura-dark shadow-sm'
                          : 'bg-white border border-neutral-300 text-neutral-800 hover:border-veloura-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="pt-4 space-y-3">
              <div className="flex gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-neutral-300 rounded bg-white px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-neutral-500 hover:text-veloura-dark font-bold px-2"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-veloura-dark">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-neutral-500 hover:text-veloura-dark font-bold px-2"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-3.5 px-6 rounded text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md ${
                    addedAnimation
                      ? 'bg-emerald-700 text-white'
                      : 'bg-veloura-dark text-veloura-sand hover:bg-veloura-charcoal'
                  } disabled:opacity-50`}
                >
                  <ShoppingBag size={18} />
                  <span>{addedAnimation ? 'Added To Bag' : 'Add To Bag'}</span>
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleDirectBuy}
                disabled={!product.inStock}
                className="w-full py-3.5 px-6 bg-veloura-gold text-veloura-dark hover:bg-veloura-gold-light text-xs uppercase font-bold tracking-[0.2em] rounded shadow-md transition disabled:opacity-50"
              >
                Instant Checkout with Razorpay
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-veloura-sand text-center">
              <div className="space-y-1">
                <Truck size={18} className="mx-auto text-veloura-gold" />
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-700">Free Express</p>
                <p className="text-[10px] text-neutral-400">Over ₹999 across India</p>
              </div>
              <div className="space-y-1">
                <ShieldCheck size={18} className="mx-auto text-veloura-gold" />
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-700">100% Genuine</p>
                <p className="text-[10px] text-neutral-400">Pure Organic Fibers</p>
              </div>
              <div className="space-y-1">
                <RefreshCw size={18} className="mx-auto text-veloura-gold" />
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-700">14-Day Return</p>
                <p className="text-[10px] text-neutral-400">Easy Doorstep Pickup</p>
              </div>
            </div>

            {/* Fabric & Care Accordion Details */}
            <div className="bg-veloura-sand/30 rounded-lg p-5 border border-veloura-sand/80 space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-widest text-veloura-dark">
                Fabrication & Garment Care
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-neutral-600">
                <div>
                  <span className="font-semibold text-neutral-800">Composition:</span>
                  <p>{product.fabric}</p>
                </div>
                <div>
                  <span className="font-semibold text-neutral-800">Care Instructions:</span>
                  <p>{product.care}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete The Look Section */}
      {completeTheLook && completeTheLook.length > 0 && (
        <div className="mt-20 pt-10 border-t border-veloura-sand">
          <div className="space-y-2 mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-veloura-gold font-bold">
              Tailored Ensemble
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-veloura-dark">
              Complete The Look
            </h2>
            <p className="text-xs text-neutral-500">
              Stylist-curated pairings tailored to complement this piece.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {completeTheLook.map((lookItem) => (
              <ProductCard
                key={lookItem.id}
                product={lookItem}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
