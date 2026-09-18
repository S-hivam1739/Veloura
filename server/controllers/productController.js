import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOGUE_PATH = path.resolve(__dirname, '../../catalogue_120_products.json');

// Load local catalogue data as safety fallback if Supabase table is empty or being initialized
let localProducts = [];
try {
  if (fs.existsSync(CATALOGUE_PATH)) {
    const raw = fs.readFileSync(CATALOGUE_PATH, 'utf-8');
    localProducts = JSON.parse(raw);
  }
} catch (e) {
  console.warn('⚠️ Could not load local catalogue fallback:', e.message);
}

/**
 * Normalize product row from Supabase to match standard frontend interface
 */
function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : Number(p.price) * 1.3,
    discountPercent: p.discount_percent !== undefined ? Number(p.discount_percent) : 25,
    image: p.image,
    images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
    sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(p.colors) ? p.colors : [{ name: 'Default', hex: '#111' }],
    inStock: Boolean(p.in_stock ?? p.inStock ?? true),
    stockQuantity: Number(p.stock_quantity ?? p.stockQuantity ?? 30),
    rating: Number(p.rating || 4.5),
    reviewCount: Number(p.review_count ?? p.reviewCount ?? 80),
    isBestSeller: Boolean(p.is_best_seller ?? p.isBestSeller ?? false),
    tags: Array.isArray(p.tags) ? p.tags : [],
    fabric: p.fabric || 'Premium Sustainable Blend',
    care: p.care || 'Machine wash delicate',
    completeTheLookIds: p.complete_the_look_ids || p.completeTheLookIds || [],
  };
}

/**
 * GET /api/products
 * Fetch catalogue products with filtering, search, and sorting
 */
export async function getProducts(req, res) {
  try {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      inStock,
      isBestSeller,
      sort,
      page = 1,
      limit = 120,
    } = req.query;

    let products = [];
    let fromSupabase = false;

    // 1. Try querying Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('products').select('*');

        if (category && category !== 'all') {
          query = query.ilike('category', category);
        }
        if (subcategory && subcategory !== 'all') {
          query = query.ilike('subcategory', subcategory);
        }
        if (inStock === 'true') {
          query = query.eq('in_stock', true);
        }
        if (isBestSeller === 'true') {
          query = query.eq('is_best_seller', true);
        }
        if (minPrice) {
          query = query.gte('price', Number(minPrice));
        }
        if (maxPrice) {
          query = query.lte('price', Number(maxPrice));
        }

        // Search query
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,subcategory.ilike.%${search}%`);
        }

        // Sorting
        if (sort === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sort === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else if (sort === 'rating') {
          query = query.order('rating', { ascending: false });
        } else {
          query = query.order('id', { ascending: true });
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          products = data.map(normalizeProduct);
          fromSupabase = true;
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase product query error:', dbErr.message);
      }
    }

    // 2. Fallback to local catalogue if Supabase not seeded yet
    if (!fromSupabase) {
      let filtered = [...localProducts];

      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
      }
      if (subcategory && subcategory !== 'all') {
        filtered = filtered.filter(p => p.subcategory?.toLowerCase() === subcategory.toLowerCase());
      }
      if (inStock === 'true') {
        filtered = filtered.filter(p => p.inStock);
      }
      if (isBestSeller === 'true') {
        filtered = filtered.filter(p => p.isBestSeller);
      }
      if (minPrice) {
        filtered = filtered.filter(p => Number(p.price) >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => Number(p.price) <= Number(maxPrice));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          p =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.subcategory?.toLowerCase().includes(q)
        );
      }

      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      products = filtered;
    }

    const total = products.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      source: fromSupabase ? 'supabase' : 'catalogue_json',
      products: paginated,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
}

/**
 * GET /api/products/:id
 * Fetch single product details with "Complete the Look" suggestions
 */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    let product = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          product = normalizeProduct(data);
        }
      } catch (err) {
        console.warn('⚠️ Supabase product by id error:', err.message);
      }
    }

    if (!product) {
      const raw = localProducts.find(p => p.id === id);
      if (raw) {
        product = normalizeProduct(raw);
      }
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Fetch Complete the Look products
    let completeTheLook = [];
    if (product.completeTheLookIds && product.completeTheLookIds.length > 0) {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from('products')
            .select('*')
            .in('id', product.completeTheLookIds);

          if (data && data.length > 0) {
            completeTheLook = data.map(normalizeProduct);
          }
        } catch (e) {
          // ignore
        }
      }

      if (completeTheLook.length === 0) {
        completeTheLook = localProducts
          .filter(p => product.completeTheLookIds.includes(p.id))
          .map(normalizeProduct);
      }
    }

    return res.json({
      success: true,
      product,
      completeTheLook,
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch product.' });
  }
}

/**
 * GET /api/categories
 * Returns category summaries and subcategory lists
 */
export async function getCategories(req, res) {
  try {
    const categories = ['men', 'women', 'kids', 'infants'];
    const summary = {};

    categories.forEach(cat => {
      const catProducts = localProducts.filter(p => p.category?.toLowerCase() === cat);
      const subcategories = [...new Set(catProducts.map(p => p.subcategory).filter(Boolean))];
      summary[cat] = {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: catProducts.length,
        subcategories,
      };
    });

    return res.json({ success: true, categories: summary });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}
