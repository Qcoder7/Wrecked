import { EdgeConfig } from '@vercel/edge-config';

export const config = { runtime: 'edge' };

const ec = new EdgeConfig(process.env.EDGE_CONFIG_CONNECTION_STRING);

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const { token } = await req.json();
    if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });

    const tokens = (await ec.get('tokens')) || {};

    const tokenObj = tokens[token];
    if (!tokenObj) return new Response(JSON.stringify({ error: 'Token invalid' }), { status: 404 });

    // Return encrypted token for verification
    return new Response(JSON.stringify({ valid: true, enctoken: tokenObj.enctoken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}
