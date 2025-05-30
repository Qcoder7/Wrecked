import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient({
  id: process.env.EDGE_CONFIG_ID,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { enctoken } = await req.json();
    if (!enctoken) {
      return new Response(JSON.stringify({ error: 'Encrypted token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Scan all keys? Edge Config does not have a direct list API, so you may want to index tokens differently.
    // For demo, assume you stored tokens as token => JSON, and also store enctoken as a key if needed.
    // Otherwise, you might need another approach to verify encrypted tokens.

    // For simplicity, try to get by enctoken key:
    const dataStr = await edgeConfig.get(enctoken);
    if (!dataStr) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
