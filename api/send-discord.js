export const config = { runtime: 'edge' };

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const data = await req.json();
    if (!data.content) return new Response(JSON.stringify({ error: 'Content required' }), { status: 400 });

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data.content }),
    });

    if (!res.ok) return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}
