const TOKEN_BLOB_NAME = 'tokens.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const blobModule = await import('@vercel/blob');

    // Parse JSON body manually (Vercel Edge)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    const body = JSON.parse(data);

    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    // Load tokens from blob storage
    let tokens = [];
    try {
      const blob = await blobModule.Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      return res.status(404).json({ error: 'No tokens found' });
    }

    // Find token
    const tokenObj = tokens.find(t => t.token === token);
    if (!tokenObj) return res.status(404).json({ error: 'Token invalid' });

    // Return valid response
    res.status(200).json({ valid: true, enctoken: tokenObj.enctoken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
