import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { validateIndianPhoneNumber } from '../utils/phoneValidator.js';
import { generateSecureOtp, saveOtp, verifyOtpCode } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/email.js';

const JWT_SECRET = process.env.JWT_SECRET || 'veloura_super_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory fallback for users if Supabase is being initialized
const memoryUsers = new Map();

/**
 * Register a new user
 * Strictly validates Indian phone number, hashes password, generates real OTP
 */
export async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields (name, email, phone, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Strict Indian Phone Validation
    const phoneValidation = validateIndianPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ error: phoneValidation.error });
    }
    const cleanPhone = phoneValidation.normalizedPhone;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (isSupabaseConfigured() && supabase) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, is_verified')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser && existingUser.is_verified) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }
    } else {
      const memUser = memoryUsers.get(cleanEmail);
      if (memUser && memUser.is_verified) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate real 6-digit OTP
    const otpCode = generateSecureOtp();
    await saveOtp(cleanEmail, otpCode, 'registration');

    // Save or update pending user
    let userId = null;
    if (isSupabaseConfigured() && supabase) {
      const { data: savedUser, error: insertError } = await supabase
        .from('users')
        .upsert(
          {
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password_hash: passwordHash,
            is_verified: false,
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (insertError) {
        console.warn('⚠️ Supabase user insert warning:', insertError.message);
      } else {
        userId = savedUser?.id;
      }
    }

    // Fallback store
    memoryUsers.set(cleanEmail, {
      id: userId || 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password_hash: passwordHash,
      is_verified: false,
      created_at: new Date(),
    });

    // Send real OTP email
    const emailResult = await sendOtpEmail(cleanEmail, otpCode, name);

    return res.status(201).json({
      success: true,
      message: 'Registration initiated. A 6-digit verification code has been sent to your email.',
      email: cleanEmail,
      requiresOtp: true,
      emailDelivered: emailResult.delivered,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to process registration.' });
  }
}

/**
 * Verify OTP and activate account
 */
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const verification = await verifyOtpCode(cleanEmail, otp);

    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    // Activate user in Supabase
    let user = null;
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq('email', cleanEmail)
        .select('id, name, email, phone, is_verified, created_at')
        .single();

      if (!error && data) {
        user = data;
      }
    }

    if (!user) {
      const memUser = memoryUsers.get(cleanEmail);
      if (memUser) {
        memUser.is_verified = true;
        user = {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          phone: memUser.phone,
          is_verified: true,
          created_at: memUser.created_at,
        };
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Verification failed.' });
  }
}

/**
 * Resend OTP code
 */
export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpCode = generateSecureOtp();
    await saveOtp(cleanEmail, otpCode, 'resend');

    await sendOtpEmail(cleanEmail, otpCode, 'Valued Customer');

    return res.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to resend OTP.' });
  }
}

/**
 * Log in existing user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        user = data;
      }
    }

    if (!user) {
      user = memoryUsers.get(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_verified) {
      // Re-send OTP if not verified yet
      const otpCode = generateSecureOtp();
      await saveOtp(cleanEmail, otpCode, 'registration');
      await sendOtpEmail(cleanEmail, otpCode, user.name);

      return res.status(403).json({
        error: 'Account not verified. A new OTP has been sent to your email.',
        requiresOtp: true,
        email: cleanEmail,
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to process login.' });
  }
}

/**
 * Get currently authenticated user profile
 */
export async function getProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, is_verified, created_at')
        .eq('id', decoded.id)
        .maybeSingle();

      if (!error && data) {
        user = data;
      }
    }

    if (!user) {
      for (const u of memoryUsers.values()) {
        if (u.id === decoded.id || u.email === decoded.email) {
          user = {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            is_verified: u.is_verified,
            created_at: u.created_at,
          };
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
