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
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dataStr = await edgeConfig.get(token);
    if (!dataStr) {
      return new Response(JSON.stringify({ error: 'Token invalid' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = JSON.parse(dataStr);

    return new Response(JSON.stringify({ valid: true, enctoken: data.enctoken }), {
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
