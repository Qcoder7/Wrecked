const TOKEN_BLOB_NAME = 'tokens.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const blobModule = await import('@vercel/blob');

    const body = await jsonBody(req);
    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let tokens = [];
    try {
      const blob = await blobModule.Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      return res.status(404).json({ error: 'No tokens found' });
    }

    const tokenObj = tokens.find(t => t.token === token);
    if (!tokenObj) return res.status(404).json({ error: 'Token invalid' });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    tokenObj.ip = ip;

    const newBlob = blobModule.Blob.from(JSON.stringify(tokens), TOKEN_BLOB_NAME, {
      type: 'application/json',
    });

    await blobModule.Blob.put(TOKEN_BLOB_NAME, newBlob);

    res.status(200).json({ enctoken: tokenObj.enctoken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};

// Helper to parse JSON body (for CommonJS on Vercel Edge)
async function jsonBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}
