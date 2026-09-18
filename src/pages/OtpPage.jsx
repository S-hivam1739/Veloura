import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clock, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OtpPage({ email, setView, onSuccessRedirect = 'profile' }) {
  const { verifyOtp, resendOtp } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes (600s)
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef([]);

  // 10-minute expiry timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const otp = digits.join('');
    if (otp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setSuccessMsg('Account verified successfully! Redirecting...');
        setTimeout(() => {
          setView(onSuccessRedirect);
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    try {
      await resendOtp(email);
      setSuccessMsg('A new 6-digit OTP has been dispatched to your email.');
      setTimer(600);
      setResendCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP.');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-veloura-sand">
        <button
          onClick={() => setView('signup')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-veloura-dark mb-6"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-veloura-sand/60 text-veloura-gold flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-800">
            Verify Your Code
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            We have dispatched a real 6-digit security code to: <br />
            <strong className="text-neutral-800">{email}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Individual Digit Inputs */}
          <div
            className="flex w-full justify-center gap-2 sm:gap-2.5"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-12 sm:w-11 sm:h-14 text-center text-xl font-bold rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:outline-none focus:border-veloura-gold focus:bg-white shadow-sm"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {/* Expiration Timer */}
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-neutral-400" />
              <span>Expires in:</span>
              <span className={`font-mono font-bold ${timer < 60 ? 'text-red-600' : 'text-neutral-800'}`}>
                {formatTimer(timer)}
              </span>
            </div>

            {/* Resend Action */}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-xs font-semibold text-veloura-gold hover:text-veloura-gold-dark disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw
                size={12}
                className={resendCooldown > 0 ? '' : 'animate-spin-once'}
              />
              <span>
                {resendCooldown > 0
                  ? `Resend (${resendCooldown}s)`
                  : 'Resend Code'}
              </span>
            </button>
          </div>

          {/* Submit Verify Button */}
          <button
            type="submit"
            disabled={loading || digits.join('').length !== 6 || timer === 0}
            className="w-full py-3.5 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-[0.2em] rounded-lg shadow-md hover:bg-veloura-charcoal transition disabled:opacity-50"
          >
            {loading ? 'Verifying Code...' : 'Verify & Continue'}
          </button>
        </form>

        <p className="text-[11px] text-center text-neutral-400 mt-6">
          Real OTP security verified via Supabase. If you don't see it, check your spam folder.
        </p>
      </div>
    </div>
  );
}