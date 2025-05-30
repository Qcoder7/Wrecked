const TOKEN_BLOB_NAME = 'tokens-LQF9Q9VAixdVmmKbTzpT3P63EOjiDq.json'; // your real blob name here
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Blob } = await import('@vercel/blob');

    // Parse JSON body safely
    const body = await getJsonBody(req);
    const { token } = body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    // Read existing tokens from blob
    let tokens = [];
    try {
      const blob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      // If blob not found or empty, start fresh
      tokens = [];
    }

    // Check if token already exists
    if (tokens.some(t => t.token === token)) {
      return res.status(409).json({ error: 'Token already stored' });
    }

    // Encrypt the token using AES-256-CBC with your .env key
    const encrypted = encryptToken(token, process.env.ENCRYPTION_KEY);

    // Create token object to store
    const tokenObj = {
      token,
      ip: '',
      enctoken: encrypted,
      status: 'unused',
    };

    tokens.push(tokenObj);

    // Save updated tokens array back to blob
    const newBlob = Blob.from(JSON.stringify(tokens), TOKEN_BLOB_NAME, {
      type: 'application/json',
    });
    await Blob.put(TOKEN_BLOB_NAME, newBlob);

    res.status(201).json({ message: 'Token stored', enctoken: encrypted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};

// Helper: Read JSON body from request
async function getJsonBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}

// Helper: AES-256-CBC encrypt token string
function encryptToken(token, keyHex) {
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Invalid encryption key length, must be 64 hex chars');
  }
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(16); // random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // Return IV + encrypted text (base64), separated by ':'
  return iv.toString('base64') + ':' + encrypted;
}
