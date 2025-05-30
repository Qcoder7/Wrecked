const TOKEN_BLOB_NAME = 'tokens-LQF9Q9VAixdVmmKbTzpT3P63EOjiDq.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const blobModule = await import('@vercel/blob');
    const { put, get } = blobModule;

    const body = await jsonBody(req);
    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let tokens = [];
    try {
      const blob = await get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      tokens = [];
    }

    const existing = tokens.find(t => t.token === token);
    if (existing) return res.status(409).json({ error: 'Token already exists' });

    // Simple encryption: reverse string (replace with your own logic)
    const enctoken = token.split('').reverse().join('');

    tokens.push({
      token,
      ip: '',
      enctoken,
      status: 'unused',
    });

    // Use put to update the tokens.json blob
    await put(TOKEN_BLOB_NAME, JSON.stringify(tokens), {
      access: 'public',
      type: 'application/json',
    });

    res.status(200).json({ message: 'Token stored', enctoken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};

async function jsonBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}
