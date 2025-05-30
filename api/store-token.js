const TOKEN_BLOB_NAME = 'tokens.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Blob } = await import('@vercel/blob');

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let tokens = [];
    try {
      const existingBlob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await existingBlob.text();
      tokens = JSON.parse(text);
    } catch {}

    const enctoken = Buffer.from(token).toString('base64');

    tokens.push({
      token,
      status: 'unused',
      ip: '',
      enctoken,
    });

    const newBlob = new Blob([JSON.stringify(tokens)], { type: 'application/json' });
    await Blob.put(TOKEN_BLOB_NAME, newBlob);

    res.status(200).json({ message: 'Token stored', enctoken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
