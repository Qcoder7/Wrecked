import { list, get, put } from '@vercel/blob';
import crypto from 'crypto';

export const config = { runtime: 'edge' };

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function getIP(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
}

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), { status: 405 });
  }

  const { token } = await req.json();
  if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });

  const blobs = await list({ prefix: 'tokens/' });
  for (const blob of blobs.blobs) {
    const data = await get(blob.pathname).then(res => res.json());
    if (data.token === token) {
      const ip = getIP(req);
      const updated = { ...data, ip };
      await put(blob.pathname, JSON.stringify(updated), { access: 'private' });
      return new Response(JSON.stringify({ enctoken: data.enctoken }), { status: 200 });
    }
  }

  return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404 });
}
