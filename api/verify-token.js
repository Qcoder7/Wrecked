import { get } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const TOKEN_BLOB_NAME = 'tokens-LQF9Q9VAixdVmmKbTzpT3P63EOjiDq.json';
    const blob = await get(TOKEN_BLOB_NAME);
    const text = await blob.text();
    const tokens = JSON.parse(text);

    const tokenObj = tokens.find(t => t.token === token);
    if (!tokenObj) {
      return new Response(JSON.stringify({ error: 'Token invalid' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ valid: true, enctoken: tokenObj.enctoken }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Blob read error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
