import { Blob } from '@vercel/blob';
import fetch from 'node-fetch';

const blob = new Blob();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { enctoken, discordUsername } = req.body;
  if (!enctoken || !discordUsername) return res.status(400).json({ error: 'Missing parameters' });

  try {
    // List all blobs in tokens/ folder to find matching enctoken (inefficient but workable)
    const blobs = await blob.list('tokens/');
    let matchedKey = null;
    let matchedData = null;

    for (const file of blobs) {
      const content = await (await blob.get(file.key)).text();
      const data = JSON.parse(content);
      if (data.enctoken === enctoken) {
        matchedKey = file.key;
        matchedData = data;
        break;
      }
    }

    if (!matchedKey) return res.status(404).json({ error: 'Encrypted token not found' });

    // Send Discord webhook
    const webhookURL = 'https://discord.com/api/webhooks/1367880439104012338/o6XRSE15oiezn-dvhKxFZbqAQuRIAhIBlImKrXwLIlkpYYIlskpQNgxcDg62w458D_ob';

    const resp = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `Discord Username Submitted: ${discordUsername}` }),
    });

    if (!resp.ok) throw new Error('Webhook failed');

    // Delete token blob to invalidate
    await blob.delete(matchedKey);

    return res.status(200).json({ message: 'Discord username sent, please proceed' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to send webhook' });
  }
}
