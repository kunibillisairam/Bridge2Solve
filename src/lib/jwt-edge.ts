export interface EdgeSessionUser {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'UNIVERSITY' | 'INDUSTRY' | 'ADMIN';
  orgName?: string | null;
  orgDetails?: string | null;
  exp?: number;
}

function base64UrlDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function verifyJwtEdge(token: string, secret: string): Promise<EdgeSessionUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Verify signature with SubtleCrypto HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature from base64url to Uint8Array
    const sigBin = base64UrlDecode(signatureB64);
    const sigBytes = new Uint8Array(sigBin.length);
    for (let i = 0; i < sigBin.length; i++) {
      sigBytes[i] = sigBin.charCodeAt(i);
    }

    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      dataToVerify
    );

    if (!isValid) return null;

    // 2. Decode and parse payload
    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as EdgeSessionUser;

    // 3. Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
