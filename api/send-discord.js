const TOKEN_BLOB_NAME = 'tokens.json';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1367880439104012338/o6XRSE15oiezn-dvhKxFZbqAQuRIAhIBlImKrXwLIlkpYYIlskpQNgxcDg62w458D_ob';

const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = await jsonBody(req);
    const { content, webhookURL } = body;
    if (!content || !webhookURL) return res.status(400).json({ error: 'Missing content or webhookURL' });

    const fetch = (await import('node-fetch')).default;

    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: 'Failed to send message', details: errorText });
    }

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};

async function jsonBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
}
