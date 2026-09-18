import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateIndianPhone } from '../utils/phoneValidator';

export default function SignupPage({ setView, setOtpEmail }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, error: '' });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, phone: val }));
    setPhoneTouched(true);
    const result = validateIndianPhone(val);
    setPhoneValidation(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict Indian Phone Validation
    const pVal = validateIndianPhone(formData.phone);
    if (!pVal.isValid) {
      setErrorMsg(pVal.error);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: pVal.phone,
        password: formData.password,
      });

      if (res.success && res.requiresOtp) {
        setOtpEmail(res.email);
        setView('otp');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
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
            Create Your Account
          </h2>
          <p className="text-xs text-neutral-500">
            Join the Veloura archive. Real OTP verification required.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold focus:bg-white text-xs"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="aarav@example.com"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold focus:bg-white text-xs"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">
              A 6-digit real OTP will be sent to this email for verification.
            </span>
          </div>

          {/* Strict Indian Mobile Number */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block uppercase font-bold tracking-wider text-neutral-700">
                Indian Mobile Number
              </label>
              <span className="text-[10px] text-neutral-400">10 digits (6-9 prefix)</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 font-semibold">
                +91
              </div>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength={13}
                className={`w-full pl-12 pr-10 py-2.5 bg-neutral-50 border rounded-lg text-neutral-900 focus:outline-none focus:bg-white text-xs ${
                  phoneTouched
                    ? phoneValidation.isValid
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : 'border-red-400 focus:border-red-400'
                    : 'border-neutral-300 focus:border-veloura-gold'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {phoneTouched && (
                  phoneValidation.isValid ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={16} className="text-red-500" />
                  )
                )}
              </div>
            </div>

            {phoneTouched && !phoneValidation.isValid && (
              <p className="text-[10px] text-red-600 mt-1">
                {phoneValidation.error}
              </p>
            )}
            {phoneTouched && phoneValidation.isValid && (
              <p className="text-[10px] text-emerald-600 mt-1">
                ✓ Valid Indian mobile number (+91 {phoneValidation.phone})
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold focus:bg-white text-xs"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (phoneTouched && !phoneValidation.isValid)}
            className="w-full mt-4 py-3 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-[0.2em] rounded-lg shadow-md hover:bg-veloura-charcoal transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Generating Secure OTP...</span>
            ) : (
              <>
                <span>Continue to OTP Verification</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <button
            onClick={() => setView('login')}
            className="font-bold text-veloura-dark hover:text-veloura-gold underline ml-1"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
