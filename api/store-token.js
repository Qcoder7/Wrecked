const TOKEN_BLOB_NAME = 'tokens-LQF9Q9VAixdVmmKbTzpT3P63EOjiDq.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Dynamically import @vercel/blob inside the function
    const blobModule = await import('@vercel/blob');

    // Parse JSON body
    const body = await jsonBody(req);
    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    // Try to get existing tokens blob and parse it
    let tokens = [];
    try {
      const blob = await blobModule.Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      // No existing tokens, start fresh
      tokens = [];
    }

    // Check if token already exists, if yes return error
    const existing = tokens.find(t => t.token === token);
    if (existing) return res.status(409).json({ error: 'Token already exists' });

    // Simple "encryption" here: reverse the token string (replace with your own logic)
    const enctoken = token.split('').reverse().join('');

    // Add new token object
    tokens.push({
      token,
      ip: '',
      enctoken,
      status: 'unused',
    });

    // Save updated tokens array back to Blob storage (as string)
    await blobModule.Blob.put(TOKEN_BLOB_NAME, JSON.stringify(tokens));

    res.status(200).json({ message: 'Token stored', enctoken });
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
