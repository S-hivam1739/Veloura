/**
 * Strict Indian Mobile Number Validation
 *
 * Rules:
 * 1. Exactly 10 digits
 * 2. Starts with 6, 7, 8, or 9
 * 3. Rejects numbers like '1234567890', all repeating digits like '9999999999', etc.
 * 4. Rejects strings with non-digit characters, length != 10
 */

export function validateIndianPhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string' && typeof rawPhone !== 'number') {
    return {
      isValid: false,
      error: 'Phone number is required.',
    };
  }

  const phoneStr = String(rawPhone).trim();

  // Strip optional leading '+91' or '91' or leading '0' if 11 or 12 digits
  let cleaned = phoneStr.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Must consist only of digits
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Phone number must contain only numeric digits.',
    };
  }

  // Must be exactly 10 digits
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: `Invalid length: Phone number must be exactly 10 digits (got ${cleaned.length}).`,
    };
  }

  // Must start with 6, 7, 8, or 9
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      error: `Invalid start digit: Indian mobile numbers must start with 6, 7, 8, or 9 (starts with ${firstDigit}).`,
    };
  }

  // Reject dummy patterns like all same digits (e.g., 9999999999, 8888888888)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid dummy number: Phone number cannot consist of the same repeated digit.',
    };
  }

  return {
    isValid: true,
    normalizedPhone: cleaned,
  };
}
