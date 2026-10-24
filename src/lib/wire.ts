/**
 * Corpus API responses travel scrambled, so the word-by-word data is not readable JSON to a
 * script that calls the API directly. This is a speed bump, not encryption: the key ships in the
 * client bundle. The middleware's page pass and rate limits do the real gatekeeping.
 *
 * Server: return NextResponse.json(pack(data)). Client: const data = await unpack(res).
 * Error bodies stay plain JSON; unpack passes anything unpacked straight through.
 */
const KEY = new TextEncoder().encode('qr·جذر·wire·v1·9c41e7b2d05a');

type Packed = { v: 1; n: string; d: string };

function toB64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(s, 'base64'));
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// A fresh nonce per response, so the same surah never looks the same twice.
function mix(bytes: Uint8Array, nonce: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const n = nonce[i % nonce.length];
    out[i] = bytes[i] ^ KEY[(i + n) % KEY.length] ^ ((n * 31 + i) & 0xff);
  }
  return out;
}

export function pack(data: unknown): Packed {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  return { v: 1, n: toB64(nonce), d: toB64(mix(new TextEncoder().encode(JSON.stringify(data)), nonce)) };
}

export async function unpack<T = any>(res: Response): Promise<T> {
  const body = await res.json();
  if (!body || body.v !== 1 || typeof body.d !== 'string') return body;
  return JSON.parse(new TextDecoder().decode(mix(fromB64(body.d), fromB64(body.n))));
}
