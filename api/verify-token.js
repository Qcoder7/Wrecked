import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const dataDir = path.resolve('./data/tokens');

async function getTokenFile(filename) {
  try {
    const data = await readFile(path.join(dataDir, filename));
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveTokenFile(filename, data) {
  await writeFile(path.join(dataDir, filename), JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, ip } = req.body;
  if (!token || !ip) return res.status(400).json({ error: 'Token and IP required' });

  const filename = `${token}.json`;
  const tokenData = await getTokenFile(filename);

  if (!tokenData) return res.status(404).json({ error: 'Token not found' });
  if (tokenData.status !== 'unused') return res.status(400).json({ error: 'Token already used' });

  // Check IP
  if (tokenData.ip && tokenData.ip !== ip) {
    return res.status(403).json({ error: 'IP mismatch' });
  }

  // Update IP in token data
  tokenData.ip = ip;
  await saveTokenFile(filename, tokenData);

  res.status(200).json({ enctoken: tokenData.enctoken });
}
