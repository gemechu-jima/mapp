// utils/imagekitService.ts
import ImageKit from 'imagekit-javascript';
import { Platform } from 'react-native';

const URL_ENDPOINT = 'https://ik.imagekit.io/i7gyw6gaf';
const PUBLIC_KEY = 'public_WG6NXRkDOBdycW3hepDkl6giae0=';
const AUTH_ENDPOINT = 'http://10.34.30.153:3000/api/imagekit-auth';

const imagekit = new ImageKit({
  urlEndpoint: URL_ENDPOINT,
  publicKey: PUBLIC_KEY,
});

export interface RNFileAsset {
  uri: string;
  name?: string;
  type?: string;
}

export interface UploadOptions {
  folder?: string;
  customFileName?: string;
  tags?: string[];
}

export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

export async function uploadToImageKit(
  asset: RNFileAsset,
  options: UploadOptions = {}
): Promise<UploadResult> {
  // 1. Fetch fresh auth parameters from your backend
  const authRes = await fetch(AUTH_ENDPOINT);
  if (!authRes.ok) {
    throw new Error(`Auth request failed with status ${authRes.status}`);
  }
  const auth = await authRes.json();

  const fileName = options.customFileName || asset.name || `upload_${Date.now()}.jpg`;
  const mimeType = asset.type || 'image/jpeg';

  // 2. Web requires an actual Blob/File, whereas iOS/Android use { uri, name, type }
  let filePayload: any;
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    filePayload = new File([blob], fileName, { type: blob.type || mimeType });
  } else {
    filePayload = {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    };
  }

  // 3. Upload to ImageKit
  const result = await imagekit.upload({
    file: filePayload,
    fileName,
    token: auth.token,
    signature: auth.signature,
    expire: auth.expire,
    folder: options.folder,
    tags: options.tags,
  });

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
  };
}