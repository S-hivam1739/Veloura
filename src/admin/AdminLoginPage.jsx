import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { adminApi } from '../utils/api';

export default function AdminLoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      if (res.token) {
        localStorage.setItem('veloura_admin_token', res.token);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-veloura-dark px-4">
      <div className="w-full max-w-sm bg-veloura-charcoal border border-neutral-800 rounded-xl p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-veloura-gold/10 rounded-full text-veloura-gold mb-3">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-wide">Veloura Admin</h1>
          <p className="text-xs text-neutral-400 mt-1">Sign in to manage products &amp; orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-veloura-dark border border-neutral-700 text-sm text-white rounded-lg focus:outline-none focus:border-veloura-gold"
              placeholder="admin@veloura.com"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-veloura-dark border border-neutral-700 text-sm text-white rounded-lg focus:outline-none focus:border-veloura-gold"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-veloura-gold text-veloura-dark text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-veloura-gold-light transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-[11px] text-neutral-500 text-center mt-6">
          Restricted area &middot; Veloura staff only
        </p>
      </div>
    </div>
  );
}