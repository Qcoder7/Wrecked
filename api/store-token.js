const TOKEN_BLOB_NAME = 'tokens-LQF9Q9VAixdVmmKbTzpT3P63EOjiDq.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Blob } = await import('@vercel/blob');

    const body = await getJsonBody(req);
    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let tokens = [];
    try {
      const blob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      tokens = [];
    }

    if (tokens.some(t => t.token === token)) {
      return res.status(409).json({ error: 'Token already stored' });
    }

    const encrypted = encryptToken(token);

    const tokenObj = {
      token,
      ip: '',
      enctoken: encrypted,
      status: 'unused',
    };

    tokens.push(tokenObj);

    const newBlob = new Blob([JSON.stringify(tokens)], { type: 'application/json' });
    await Blob.put(TOKEN_BLOB_NAME, newBlob);


    res.status(201).json({ message: 'Token stored', enctoken: encrypted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};

async function getJsonBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}

function encryptToken(token) {
  return Buffer.from(token).toString('base64');
}
