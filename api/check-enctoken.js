import { list, get } from '@vercel/blob';

function getIP(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
}

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), { status: 405 });
  }

  const { enctoken } = await req.json();
  if (!enctoken) return new Response(JSON.stringify({ error: 'Encrypted token required' }), { status: 400 });

  const blobs = await list({ prefix: 'tokens/' });
  for (const blob of blobs.blobs) {
    const data = await get(blob.pathname).then(res => res.json());
    if (data.enctoken === enctoken) {
      const userIP = getIP(req);
      if (data.ip === userIP) {
        return new Response(JSON.stringify({ valid: true }), { status: 200 });
      }
    }
  }

  return new Response(JSON.stringify({ valid: false }), { status: 403 });
}
