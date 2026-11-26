import { Platform } from 'react-native';

const CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || 'djqmtxpds';
const API_KEY =
  process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY?.trim() || '444276969955276';
const API_SECRET =
  process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET?.trim() ||
  'Bii4yjeI64KINz6vR4ycTGNVciA';

export interface RNFileAsset {
  uri: string;
  name?: string;
  type?: string;
}

export interface UploadImageOptions {
  /** Cloudinary folder (e.g. "payment-proofs", "profiles") */
  folder?: string;
  /** Optional custom public_id / file name without extension */
  publicId?: string;
  /** Optional custom file name with extension */
  customFileName?: string;
  /** Optional tags for organizing assets in Cloudinary */
  tags?: string[];
  /** Optional unsigned upload preset; if omitted, signed upload is used */
  uploadPreset?: string;
  /** Override Cloudinary cloud name if needed */
  cloudName?: string;
}

export interface UploadImageResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Pure-TS UTF-8 SHA-1 implementation for Cloudinary signed uploads.
 * Works identically on React Native (Hermes/JSC) and Web without native dependencies.
 */
export function sha1(input: string): string {
  const bytes = encodeUtf8(input);
  const bitLen = bytes.length * 8;

  // Pad with 0x80, then 0x00 until length ≡ 56 (mod 64), then 64-bit big-endian length
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Int32Array(80);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getInt32(offset + i * 4, false);
    }
    for (let i = 16; i < 80; i++) {
      const n = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (n << 1) | (n >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i++) {
      let f = 0;
      let k = 0;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return [h0, h1, h2, h3, h4]
    .map((n) => (n >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

function encodeUtf8(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const encoded = unescape(encodeURIComponent(str));
  const out = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    out[i] = encoded.charCodeAt(i);
  }
  return out;
}

function normalizeFolder(folder?: string): string | undefined {
  if (!folder) return undefined;
  const cleaned = folder.trim().replace(/^\/+|\/+$/g, '');
  return cleaned || undefined;
}

function buildCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const sortedQuery = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return sha1(`${sortedQuery}${apiSecret}`);
}

/**
 * Generic image uploader for Cloudinary.
 * Uploads directly from the mobile/web client to Cloudinary and returns the hosted URL,
 * so the backend database only stores the URL without saving image files on the server.
 *
 * Reusable for payment proofs, profile avatars, or any other image upload.
 */
export async function uploadImage(
  asset: RNFileAsset | string,
  options: UploadImageOptions = {},
): Promise<UploadImageResult> {
  const normalizedAsset: RNFileAsset =
    typeof asset === 'string' ? { uri: asset } : asset;

  if (!normalizedAsset?.uri) {
    throw new Error('Image URI is required for upload.');
  }

  const cloudName = options.cloudName?.trim() || CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  const fileName =
    options.customFileName ||
    normalizedAsset.name ||
    `upload_${Date.now()}.jpg`;
  const mimeType = normalizedAsset.type || 'image/jpeg';
  const folder = normalizeFolder(options.folder);
  const tags = options.tags?.length ? options.tags.join(',') : undefined;

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(normalizedAsset.uri);
    const blob = await response.blob();
    const webFile = new File([blob], fileName, {
      type: blob.type || mimeType,
    });
    formData.append('file', webFile);
  } else {
    formData.append('file', {
      uri: normalizedAsset.uri,
      name: fileName,
      type: mimeType,
    } as any);
  }

  if (folder) {
    formData.append('folder', folder);
  }
  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }
  if (tags) {
    formData.append('tags', tags);
  }

  if (options.uploadPreset) {
    formData.append('upload_preset', options.uploadPreset);
  } else {
    if (!API_KEY || !API_SECRET) {
      throw new Error('Cloudinary API key and secret are required for signed uploads.');
    }
    const timestamp = String(Math.floor(Date.now() / 1000));
    const paramsToSign: Record<string, string> = { timestamp };
    if (folder) paramsToSign.folder = folder;
    if (options.publicId) paramsToSign.public_id = options.publicId;
    if (tags) paramsToSign.tags = tags;

    const signature = buildCloudinarySignature(paramsToSign, API_SECRET);

    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const uploadRes = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !data?.secure_url) {
    const message =
      data?.error?.message ||
      `Cloudinary upload failed with status ${uploadRes.status}`;
    throw new Error(message);
  }

  return {
    url: data.secure_url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}

export const uploadToCloudinary = uploadImage;
export default uploadImage;
