const TOKEN_BLOB_NAME = 'tokens.json';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1367880439104012338/o6XRSE15oiezn-dvhKxFZbqAQuRIAhIBlImKrXwLIlkpYYIlskpQNgxcDg62w458D_ob';

const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Blob } = await import('@vercel/blob');

    const { enctoken, discordUsername } = req.body;
    if (!enctoken || !discordUsername) return res.status(400).json({ error: 'Missing parameters' });

    // Get tokens blob
    let tokens = [];
    try {
      const blob = await Blob.get(TOKEN_BLOB_NAME);
      const text = await blob.text();
      tokens = JSON.parse(text);
    } catch {
      return res.status(404).json({ error: 'No tokens found' });
    }

    // Send message to Discord webhook
    const message = {
      content: `Discord Username: ${discordUsername}`,
    };

    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!discordRes.ok) return res.status(500).json({ error: 'Failed to send Discord message' });

    // Remove token with matching enctoken from tokens list
    tokens = tokens.filter(t => t.enctoken !== enctoken);

    // Save updated tokens blob
    const newBlob = new Blob([JSON.stringify(tokens)], { type: 'application/json' });
    await Blob.put(TOKEN_BLOB_NAME, newBlob);

    res.status(200).json({ message: 'Discord username sent and token deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
