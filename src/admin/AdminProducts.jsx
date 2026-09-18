import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';
import { adminApi } from '../utils/api';

const emptyForm = {
  id: '',
  name: '',
  category: 'men',
  subcategory: '',
  description: '',
  price: '',
  originalPrice: '',
  discountPercent: '',
  image: '',
  inStock: true,
  stockQuantity: '',
  isBestSeller: false,
  fabric: '',
  care: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setEditingId(p.id);
    setForm({
      id: p.id,
      name: p.name || '',
      category: p.category || 'men',
      subcategory: p.subcategory || '',
      description: p.description || '',
      price: p.price ?? '',
      originalPrice: p.original_price ?? '',
      discountPercent: p.discount_percent ?? '',
      image: p.image || '',
      inStock: p.in_stock ?? true,
      stockQuantity: p.stock_quantity ?? '',
      isBestSeller: p.is_best_seller ?? false,
      fabric: p.fabric || '',
      care: p.care || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
        stockQuantity: form.stockQuantity ? Number(form.stockQuantity) : 0,
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete product "${id}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) =>
    `${p.name} ${p.id} ${p.category} ${p.subcategory}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 text-sm rounded-lg focus:outline-none focus:border-veloura-gold"
          />
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-veloura-dark text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="bg-white border border-veloura-sand rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-veloura-sand/40 text-left text-[11px] uppercase tracking-wider text-neutral-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img src={p.image} alt={p.name} className="w-9 h-11 object-cover rounded bg-neutral-100" />
                        )}
                        <div>
                          <p className="font-medium text-neutral-800 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-neutral-400">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-neutral-600">{p.category} &middot; {p.subcategory}</td>
                    <td className="px-4 py-3 text-neutral-800 font-medium">₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-neutral-600">{p.stock_quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(p)}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-veloura-gold hover:text-veloura-gold-dark transition"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-red-400 hover:text-red-600 transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white">
              <h3 className="font-serif text-lg font-bold text-veloura-dark">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="infants">Infants</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Subcategory</label>
                  <input
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Image URL</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Fabric</label>
                  <input
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Care Instructions</label>
                  <input
                    value={form.care}
                    onChange={(e) => setForm({ ...form, care: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-veloura-gold"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="inStock"
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="accent-veloura-gold"
                  />
                  <label htmlFor="inStock" className="text-xs text-neutral-600">In Stock</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isBestSeller"
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                    className="accent-veloura-gold"
                  />
                  <label htmlFor="isBestSeller" className="text-xs text-neutral-600">Best Seller</label>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-veloura-dark text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}