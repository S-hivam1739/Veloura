/**
 * Frontend Indian Phone Number Validator
 * Strict rules:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Rejects non-digit, dummy, or invalid numbers
 */

export function validateIndianPhone(input) {
  if (!input) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const raw = String(input).trim();
  let cleaned = raw.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Only numeric digits allowed.' };
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: `Must be exactly 10 digits (currently ${cleaned.length}).`,
    };
  }

  if (!['6', '7', '8', '9'].includes(cleaned[0])) {
    return {
      isValid: false,
      error: 'Must start with 6, 7, 8, or 9.',
    };
  }

  if (/^(\d)\1{9}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Cannot be all repeating digits.',
    };
  }

  return {
    isValid: true,
    phone: cleaned,
  };
}
