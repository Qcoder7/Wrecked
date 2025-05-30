const TOKEN_BLOB_NAME = 'tokens.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Blob } = await import('@vercel/blob');

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let tokens = [];
    try {
      const blob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      // If blob not found, create it with new token
      tokens = [];
    }

    // Check if token already exists
    const existing = tokens.find(t => t.token === token);
    if (existing) {
      return res.status(409).json({ error: 'Token already exists' });
    }

    // Encrypt token (dummy method for now — use real encryption in prod)
    const enctoken = Buffer.from(token).toString('hex');

    tokens.push({
      token,
      status: 'unused',
      ip: '',
      enctoken
    });

    const newBlob = new Blob([JSON.stringify(tokens)], { type: 'application/json' });
    await Blob.put(TOKEN_BLOB_NAME, newBlob);

    res.status(200).json({ success: true, enctoken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
