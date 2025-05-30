import crypto from 'crypto';
import { Blob } from '@vercel/blob';
const { Blob } = await import('@vercel/blob');
const AES_KEY = process.env.AES_KEY;
if (!AES_KEY) throw new Error('Missing AES_KEY env variable');

const blob = new Blob();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const key = Buffer.from(AES_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const enctoken = iv.toString('hex') + ':' + encrypted;

    const tokenData = {
      token,
      status: 'unused',
      ip: '',
      enctoken,
    };

    // Save tokenData as JSON blob, key = token.json
    await blob.put(`tokens/${token}.json`, JSON.stringify(tokenData), { contentType: 'application/json' });

    return res.status(200).json({ enctoken });
  } catch (e) {
    return res.status(500).json({ error: 'Encryption failed' });
  }
}
