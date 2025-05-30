import { EdgeConfig } from '@vercel/edge-config';

export const config = { runtime: 'edge' };

const ec = new EdgeConfig(process.env.EDGE_CONFIG_CONNECTION_STRING);

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { enctoken } = await req.json();
    if (!enctoken) return new Response(JSON.stringify({ error: 'Encrypted token required' }), { status: 400 });

    const tokens = (await ec.get('tokens')) || {};

    // Find token entry by matching enctoken
    const tokenObj = Object.values(tokens).find(t => t.enctoken === enctoken);
    if (!tokenObj) return new Response(JSON.stringify({ error: 'Encrypted token invalid' }), { status: 404 });

    return new Response(JSON.stringify({ valid: true, token: tokenObj.token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}
