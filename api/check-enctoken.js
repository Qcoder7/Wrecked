const TOKEN_BLOB_NAME = 'tokens.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Blob } = await import('@vercel/blob');

    const { enctoken } = req.body;
    if (!enctoken) return res.status(400).json({ error: 'enctoken required' });

    let tokens = [];
    try {
      const blob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      return res.status(404).json({ error: 'No tokens found' });
    }

    const tokenObj = tokens.find(t => t.enctoken === enctoken);
    if (!tokenObj) return res.status(404).json({ error: 'Encrypted token invalid' });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    if (tokenObj.ip !== ip) {
      return res.status(403).json({ error: 'IP mismatch' });
    }

    res.status(200).json({ valid: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
