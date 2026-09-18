import React, { useState, useEffect } from 'react';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';

export default function CataloguePage({
  category = 'all',
  setCategory,
  searchQuery = '',
  setSearchQuery,
  onSelectProduct,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategory, setSubcategory] = useState('all');
  const [subcategories, setSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {
          category: category !== 'all' ? category : undefined,
          subcategory: subcategory !== 'all' ? subcategory : undefined,
          search: searchQuery || undefined,
          maxPrice: priceRange < 10000 ? priceRange : undefined,
          inStock: inStockOnly ? 'true' : undefined,
          sort: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : sortBy === 'rating' ? 'rating' : undefined,
          limit: 120,
        };

        const res = await api.getProducts(params);
        setProducts(res.products || []);

        // Extract subcategories if on specific category
        if (res.products) {
          const subs = [...new Set(res.products.map(p => p.subcategory).filter(Boolean))];
          setSubcategories(subs);
        }
      } catch (err) {
        console.error('Failed to load catalogue products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [category, subcategory, searchQuery, priceRange, inStockOnly, sortBy]);

  const categories = [
    { id: 'all', label: 'All Garments (120)' },
    { id: 'men', label: 'Men (30)' },
    { id: 'women', label: 'Women (30)' },
    { id: 'kids', label: 'Kids (30)' },
    { id: 'infants', label: 'Infants (30)' },
  ];

  const clearAllFilters = () => {
    setCategory('all');
    setSubcategory('all');
    setSearchQuery('');
    setPriceRange(10000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    category !== 'all' ||
    subcategory !== 'all' ||
    Boolean(searchQuery) ||
    priceRange < 10000 ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalogue Header */}
      <div className="border-b border-veloura-sand pb-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-veloura-dark uppercase tracking-wide">
              {category === 'all' ? 'All Garments' : `${category} Collection`}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
              Curated Luxury Apparel • Supabase Handled • {products.length} Products Found
            </p>
          </div>

          {/* Active Search Badge */}
          {searchQuery && (
            <div className="inline-flex items-center gap-2 bg-veloura-sand/60 px-3 py-1.5 rounded-full text-xs text-veloura-dark">
              <span>Search: "<strong>{searchQuery}</strong>"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setSubcategory('all');
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                category === cat.id
                  ? 'bg-veloura-dark text-veloura-sand shadow-sm'
                  : 'bg-white border border-veloura-sand text-neutral-600 hover:border-veloura-gold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Subcategories, Sorting & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-lg border border-veloura-sand/80 shadow-sm">
        {/* Subcategories (desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex-shrink-0">
            Type:
          </span>
          <button
            onClick={() => setSubcategory('all')}
            className={`px-3 py-1 rounded text-xs transition flex-shrink-0 ${
              subcategory === 'all'
                ? 'bg-veloura-sand font-bold text-veloura-dark'
                : 'text-neutral-600 hover:text-veloura-dark'
            }`}
          >
            All
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubcategory(sub)}
              className={`px-3 py-1 rounded text-xs transition flex-shrink-0 ${
                subcategory === sub
                  ? 'bg-veloura-sand font-bold text-veloura-dark'
                  : 'text-neutral-600 hover:text-veloura-dark'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Sort & Filter toggles */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* In Stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-veloura-dark rounded"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown size={14} className="text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-veloura-gold"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:underline font-medium ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-lg border border-veloura-sand p-10">
          <SlidersHorizontal size={40} className="mx-auto text-neutral-400" />
          <h3 className="font-serif text-xl font-bold text-veloura-dark">No garments match your filters</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all 120 pieces.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
