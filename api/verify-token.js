export default async function handler(req, res) {
  // Dynamically import Blob inside the function
  const { Blob } = await import('@vercel/blob');

const blob = new Blob();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, ip } = req.body;
  if (!token || !ip) return res.status(400).json({ error: 'Token and IP required' });

  try {
    const key = `tokens/${token}.json`;
    const tokenBlob = await blob.get(key);

    if (!tokenBlob) return res.status(404).json({ error: 'Token not found' });

    const tokenData = JSON.parse(await tokenBlob.text());

    if (tokenData.status !== 'unused') return res.status(400).json({ error: 'Token already used' });

    if (tokenData.ip && tokenData.ip !== ip) return res.status(403).json({ error: 'IP mismatch' });

    // Update IP
    tokenData.ip = ip;

    await blob.put(key, JSON.stringify(tokenData), { contentType: 'application/json' });

    return res.status(200).json({ enctoken: tokenData.enctoken });
  } catch (e) {
    return res.status(500).json({ error: 'Verification failed' });
  }
}
