import { put } from '@vercel/blob';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 64 hex chars (32 bytes)
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const enctoken = encrypt(token);

  const data = {
    token,
    status: 'unused',
    ip: '',
    enctoken,
  };

  const blobName = `tokens/${Date.now()}-${Math.random().toString(36).substring(7)}.json`;

  try {
    await put(blobName, JSON.stringify(data), {
      access: 'private',
    });

    return res.status(200).json({ message: 'Token stored successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to store token' });
  }
}
