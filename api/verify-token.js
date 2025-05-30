import { get } from '@vercel/edge-config';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { token } = await req.json();
    if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });

    // Get all tokens stored under 'tokens' key
    const tokens = (await get('tokens')) || {};

    const tokenObj = tokens[token];
    if (!tokenObj) return new Response(JSON.stringify({ error: 'Token invalid' }), { status: 404 });

    return new Response(JSON.stringify({ valid: true, enctoken: tokenObj.enctoken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}
