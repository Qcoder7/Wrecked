import { readFile, unlink } from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

const dataDir = path.resolve('./data/tokens');

async function getTokenFile(filename) {
  try {
    const data = await readFile(path.join(dataDir, filename));
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function deleteTokenFile(filename) {
  await unlink(path.join(dataDir, filename));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { enctoken, discordUsername } = req.body;
  if (!enctoken || !discordUsername) return res.status(400).json({ error: 'Missing parameters' });

  // Find token by enctoken - scan files (inefficient, but for demo)
  const fs = await import('fs');
  const files = fs.readdirSync(dataDir);
  let foundToken = null;
  for (const file of files) {
    const data = JSON.parse(await readFile(path.join(dataDir, file)));
    if (data.enctoken === enctoken) {
      foundToken = { file, data };
      break;
    }
  }

  if (!foundToken) return res.status(404).json({ error: 'Encrypted token not found' });

  // Send Discord webhook
  const webhookURL = 'https://discord.com/api/webhooks/1367880439104012338/o6XRSE15oiezn-dvhKxFZbqAQuRIAhIBlImKrXwLIlkpYYIlskpQNgxcDg62w458D_ob';

  try {
    const resp = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `Discord Username Submitted: ${discordUsername}`,
      }),
    });
    if (!resp.ok) throw new Error('Webhook failed');

    // Delete token file to invalidate
    await deleteTokenFile(foundToken.file);

    res.status(200).json({ message: 'Discord username sent, please proceed' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send webhook' });
  }
}
