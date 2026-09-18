import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'veloura_super_secure_jwt_secret_key_2026';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@veloura.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123';

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase().trim() || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ email: cleanEmail, role: 'admin' }, JWT_SECRET, {
      expiresIn: '12h',
    });

    return res.json({
      success: true,
      message: 'Admin logged in successfully.',
      token,
      admin: { email: cleanEmail },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Failed to process admin login.' });
  }
}

export async function adminGetProducts(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured. Product management requires a connected database.' });
    }

    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });

    if (error) {
      console.error('Admin fetch products error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch products.' });
    }

    return res.json({ success: true, total: data.length, products: data });
  } catch (error) {
    console.error('Admin fetch products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
}

export async function adminCreateProduct(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured. Product management requires a connected database.' });
    }

    const body = req.body || {};
    if (!body.name || !body.category || !body.price) {
      return res.status(400).json({ error: 'name, category, and price are required.' });
    }

    const generatedId =
      body.id && body.id.trim()
        ? body.id.trim()
        : `${body.category.toLowerCase().trim()}-${Date.now().toString(36)}`;

    const productRow = {
      id: generatedId,
      name: body.name,
      category: body.category,
      subcategory: body.subcategory || 'General',
      description: body.description || '',
      price: Number(body.price),
      original_price: body.originalPrice ? Number(body.originalPrice) : Number(body.price),
      discount_percent: body.discountPercent !== undefined ? Number(body.discountPercent) : 0,
      image: body.image || '',
      images: Array.isArray(body.images) ? body.images : body.image ? [body.image] : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(body.colors) ? body.colors : [{ name: 'Default', hex: '#111111' }],
      in_stock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      stock_quantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : 0,
      is_best_seller: Boolean(body.isBestSeller),
      tags: Array.isArray(body.tags) ? body.tags : [],
      fabric: body.fabric || '',
      care: body.care || '',
    };

    const { data, error } = await supabase.from('products').insert([productRow]).select().single();

    if (error) {
      console.error('Admin create product error:', error.message);
      return res.status(500).json({ error: 'Failed to create product. It may already exist with this ID.' });
    }

    return res.status(201).json({ success: true, product: data });
  } catch (error) {
    console.error('Admin create product error:', error);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
}

export async function adminUpdateProduct(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured. Product management requires a connected database.' });
    }

    const { id } = req.params;
    const body = req.body || {};

    const updateRow = {};
    if (body.name !== undefined) updateRow.name = body.name;
    if (body.category !== undefined) updateRow.category = body.category;
    if (body.subcategory !== undefined) updateRow.subcategory = body.subcategory;
    if (body.description !== undefined) updateRow.description = body.description;
    if (body.price !== undefined) updateRow.price = Number(body.price);
    if (body.originalPrice !== undefined) updateRow.original_price = Number(body.originalPrice);
    if (body.discountPercent !== undefined) updateRow.discount_percent = Number(body.discountPercent);
    if (body.image !== undefined) updateRow.image = body.image;
    if (body.images !== undefined) updateRow.images = body.images;
    if (body.sizes !== undefined) updateRow.sizes = body.sizes;
    if (body.colors !== undefined) updateRow.colors = body.colors;
    if (body.inStock !== undefined) updateRow.in_stock = Boolean(body.inStock);
    if (body.stockQuantity !== undefined) updateRow.stock_quantity = Number(body.stockQuantity);
    if (body.isBestSeller !== undefined) updateRow.is_best_seller = Boolean(body.isBestSeller);
    if (body.tags !== undefined) updateRow.tags = body.tags;
    if (body.fabric !== undefined) updateRow.fabric = body.fabric;
    if (body.care !== undefined) updateRow.care = body.care;

    const { data, error } = await supabase
      .from('products')
      .update(updateRow)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Admin update product error:', error.message);
      return res.status(500).json({ error: 'Failed to update product.' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json({ success: true, product: data });
  } catch (error) {
    console.error('Admin update product error:', error);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
}

export async function adminDeleteProduct(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured. Product management requires a connected database.' });
    }

    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Admin delete product error:', error.message);
      return res.status(500).json({ error: 'Failed to delete product.' });
    }

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
}

export async function adminGetOrders(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured. Order management requires a connected database.' });
    }

    const { status, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('orders')
      .select(`*, order_items (*)`, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('order_status', status);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Admin fetch orders error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch orders.' });
    }

    const orders = (data || []).map(o => ({ ...o, items: o.order_items || [] }));

    return res.json({ success: true, total: count ?? orders.length, page: pageNum, limit: limitNum, orders });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
}

export async function adminUpdateOrderStatus(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured. Order management requires a connected database.' });
    }

    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({ error: 'orderStatus or paymentStatus is required.' });
    }

    const updateRow = {};
    if (orderStatus) updateRow.order_status = orderStatus;
    if (paymentStatus) updateRow.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from('orders')
      .update(updateRow)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Admin update order status error:', error.message);
      return res.status(500).json({ error: 'Failed to update order status.' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json({ success: true, order: data });
  } catch (error) {
    console.error('Admin update order status error:', error);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
}

export async function adminGetStats(req, res) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Supabase is not configured.' });
    }

    const [{ count: productCount }, { count: orderCount }, { count: userCount }, { data: orderTotals }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount, payment_status'),
    ]);

    const revenue = (orderTotals || [])
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        totalCustomers: userCount || 0,
        totalRevenue: revenue,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
}