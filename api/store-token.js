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

    // Simple encryption: base64 (replace with your own method)
    const enctoken = btoa(token);

    // Store in Edge Config: key=token, value=JSON string with data
    await edgeConfig.set(token, JSON.stringify({
      token,
      ip: '',
      enctoken,
      status: 'unused',
    }));

    return new Response(JSON.stringify({ success: true, enctoken }), {
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
