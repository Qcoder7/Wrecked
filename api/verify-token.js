const TOKEN_BLOB_NAME = 'tokens-LQF9Q9VAixdVmmKbTzpT3P63EOjiDq.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { get } = await import('@vercel/blob');

    const body = await jsonBody(req);
    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let tokens = [];
    try {
      const blob = await get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch (e) {
      console.error('Blob read error:', e);
      return res.status(404).json({ error: 'No tokens found' });
    }

    const tokenObj = tokens.find(t => t.token === token);
    if (!tokenObj) return res.status(404).json({ error: 'Token invalid' });

    res.status(200).json({ valid: true, enctoken: tokenObj.enctoken });
  } catch (e) {
    console.error('Internal error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
};

// Helper to parse JSON body
async function jsonBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}
