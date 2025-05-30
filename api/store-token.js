import crypto from 'crypto';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';

const AES_KEY = process.env.AES_KEY;
if (!AES_KEY) throw new Error('Missing AES_KEY env variable');

const dataDir = path.resolve('./data/tokens');

async function saveTokenFile(filename, data) {
  await writeFile(path.join(dataDir, filename), JSON.stringify(data));
}

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

    // Make sure data directory exists
    await import('fs').then(fs => {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    });

    // Save JSON file named by token
    await saveTokenFile(`${token}.json`, tokenData);

    return res.status(200).json({ enctoken });
  } catch (e) {
    return res.status(500).json({ error: 'Encryption failed' });
  }
}
