export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { enctoken } = await req.json();
    if (!enctoken) return new Response(JSON.stringify({ error: 'Encrypted token required' }), { status: 400 });

    // Generate linkvertise link example:
    const linkvertiseUserId = '991963';
    const redirectUrl = `https://wreckedgen.vercel.app/entercode?token=${encodeURIComponent(enctoken)}`;
    const linkvertiseUrl = `https://linkvertise.com/${linkvertiseUserId}/redirect?target=${encodeURIComponent(redirectUrl)}`;

    return new Response(JSON.stringify({ url: linkvertiseUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}
