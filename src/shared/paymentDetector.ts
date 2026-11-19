import type { PaymentProvider } from '@/types/payment';

export type DetectedPaymentMethod = 'CBE' | 'Telebirr' | 'Awash' | 'Absina' | null;

/**
 * Detects Ethiopian payment provider based on the reference number format.
 *
 * Patterns:
 * - CBE (Commercial Bank of Ethiopia): Starts with FT or CBE (e.g., FT240101ABCD, CBE123456)
 * - Telebirr: Starts with DBR, TXN, MP, CR, or TB (e.g., DBR240101, TXN123456, MP091234)
 * - Awash: Starts with AWT, AWB, or AT (e.g., AWT2401, AWB12345)
 * - Absina (Bank of Abyssinia): Starts with BOA, ABS, or APO (e.g., BOA12345, ABS67890)
 */
export function detectPaymentProvider(reference: string): DetectedPaymentMethod {
  if (!reference || typeof reference !== 'string') return null;
  const clean = reference.trim().toUpperCase();
  if (clean.length < 3) return null;

  if (/^(?:FT|CBE)[0-9A-Z]{3,}$/i.test(clean)) {
    return 'CBE';
  }
  if (/^(?:DBR|TXN|MP|CR|TB)[0-9A-Z]{3,}$/i.test(clean)) {
    return 'Telebirr';
  }
  if (/^(?:AWT|AWB|AT)[0-9A-Z]{3,}$/i.test(clean)) {
    return 'Awash';
  }
  if (/^(?:BOA|ABS|APO)[0-9A-Z]{3,}$/i.test(clean)) {
    return 'Absina';
  }
  return null;
}
