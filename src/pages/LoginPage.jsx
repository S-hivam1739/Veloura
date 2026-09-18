import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setView, setOtpEmail, onSuccessRedirect = 'profile' }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        setView(onSuccessRedirect);
      }
    } catch (err) {
      if (err.data?.requiresOtp) {
        setOtpEmail(err.data.email || formData.email);
        setView('otp');
      } else {
        setErrorMsg(err.message || 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-veloura-sand">
        <div className="text-center space-y-2 mb-8">
          <span className="font-serif text-2xl font-bold tracking-[0.2em] text-veloura-dark uppercase">
            VELOURA
          </span>
          <h2 className="font-serif text-xl font-bold text-neutral-800">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-neutral-500">
            Access your order archive and tailored profile.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold focus:bg-white text-xs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block uppercase font-bold tracking-wider text-neutral-700">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold focus:bg-white text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-[0.2em] rounded-lg shadow-md hover:bg-veloura-charcoal transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <button
            onClick={() => setView('signup')}
            className="font-bold text-veloura-dark hover:text-veloura-gold underline ml-1"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}