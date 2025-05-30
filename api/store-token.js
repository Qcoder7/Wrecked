import { get, set } from '@vercel/edge-config';

export const config = { runtime: 'edge' };

const ec = new EdgeConfig(process.env.EDGE_CONFIG_CONNECTION_STRING);

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const body = await req.json();
    const { token } = body;
    if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });

    // Simple encryption stub - replace with your actual encryption logic
    const enctoken = btoa(token); // base64 encoding for example only

    // Get existing tokens or empty object
    const tokens = (await ec.get('tokens')) || {};

    // Add new token entry
    tokens[token] = { token, ip: '', enctoken, status: 'unused' };

    // Save back
    await ec.set('tokens', tokens);

    return new Response(JSON.stringify({ success: true, enctoken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}
