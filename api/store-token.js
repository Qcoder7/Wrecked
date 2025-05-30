const TOKEN_BLOB_NAME = 'tokens.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Manually parse JSON body for Vercel Edge function
    const bodyText = await new Response(req).text();
    const body = JSON.parse(bodyText);

    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const { Blob } = await import('@vercel/blob');

    let tokens = [];
    try {
      const blob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      tokens = [];
    }

    if (tokens.find(t => t.token === token)) {
      return res.status(409).json({ error: 'Token already exists' });
    }

    const enctoken = Buffer.from(token).toString('hex');

    tokens.push({ token, status: 'unused', ip: '', enctoken });

    const newBlob = new Blob([JSON.stringify(tokens)], { type: 'application/json' });
    await Blob.put(TOKEN_BLOB_NAME, newBlob);

    res.status(200).json({ success: true, enctoken });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Invalid JSON or internal error' });
  }
};
