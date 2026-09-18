import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
const MAX_ATTEMPTS = 5;

// In-memory fallback cache in case Supabase is in transition
const memoryOtpStore = new Map();

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Store OTP in database with expiration and attempt tracking
 */
export async function saveOtp(identifier, otpCode, type = 'registration') {
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000).toISOString();

  // Clean old OTPs for this identifier in memory
  memoryOtpStore.set(identifier.toLowerCase(), {
    otpCode,
    type,
    expiresAt: new Date(expiresAt),
    verified: false,
    attempts: 0,
    createdAt: new Date(),
  });

  if (isSupabaseConfigured() && supabase) {
    try {
      // Invalidate existing active OTPs for this identifier
      await supabase
        .from('otps')
        .update({ verified: true })
        .eq('identifier', identifier.toLowerCase())
        .eq('verified', false);

      const { data, error } = await supabase
        .from('otps')
        .insert([
          {
            identifier: identifier.toLowerCase(),
            otp_code: otpCode,
            type,
            expires_at: expiresAt,
            verified: false,
            attempts: 0,
          },
        ])
        .select();

      if (error) {
        console.warn('⚠️ Could not save OTP to Supabase, used in-memory fallback:', error.message);
      } else {
        return data?.[0];
      }
    } catch (err) {
      console.warn('⚠️ Supabase OTP save exception:', err.message);
    }
  }

  return memoryOtpStore.get(identifier.toLowerCase());
}

/**
 * Verify OTP against database / store
 */
export async function verifyOtpCode(identifier, inputCode) {
  const cleanedId = identifier.toLowerCase().trim();
  const code = String(inputCode).trim();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: records, error } = await supabase
        .from('otps')
        .select('*')
        .eq('identifier', cleanedId)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && records && records.length > 0) {
        const otpRecord = records[0];

        // Check if expired
        if (new Date() > new Date(otpRecord.expires_at)) {
          return { valid: false, error: 'OTP has expired. Please request a new one.' };
        }

        // Check max attempts
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
          return { valid: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
        }

        // Check code match
        if (otpRecord.otp_code !== code) {
          await supabase
            .from('otps')
            .update({ attempts: otpRecord.attempts + 1 })
            .eq('id', otpRecord.id);

          return { valid: false, error: `Invalid OTP. ${MAX_ATTEMPTS - (otpRecord.attempts + 1)} attempts remaining.` };
        }

        // Success: Mark as verified
        await supabase
          .from('otps')
          .update({ verified: true })
          .eq('id', otpRecord.id);

        return { valid: true };
      }
    } catch (err) {
      console.warn('⚠️ Supabase OTP verify error, checking fallback store:', err.message);
    }
  }

  // Fallback memory check
  const record = memoryOtpStore.get(cleanedId);
  if (!record) {
    return { valid: false, error: 'No active OTP found. Please request a new one.' };
  }

  if (new Date() > record.expiresAt) {
    memoryOtpStore.delete(cleanedId);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    memoryOtpStore.delete(cleanedId);
    return { valid: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.otpCode !== code) {
    record.attempts += 1;
    return { valid: false, error: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` };
  }

  record.verified = true;
  memoryOtpStore.delete(cleanedId);
  return { valid: true };
}
