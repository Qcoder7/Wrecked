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

    // Example Linkvertise generation - customize your logic here
    const linkvertiseUserId = '991963';
    const url = `https://linkvertise.com/${linkvertiseUserId}/redirect?token=${encodeURIComponent(enctoken)}`;

    return new Response(JSON.stringify({ url }), {
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
