import { Blob } from '@vercel/blob';
const { Blob } = await import('@vercel/blob');
const blob = new Blob();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { enctoken } = req.body;
  if (!enctoken) return res.status(400).json({ error: 'Missing enctoken' });

  try {
    // List all tokens
    const blobs = await blob.list('tokens/');
    for (const file of blobs) {
      const content = await (await blob.get(file.key)).text();
      const data = JSON.parse(content);

      if (data.enctoken === enctoken) {
        return res.status(200).json({ found: true, data });
      }
    }

    return res.status(404).json({ found: false, error: 'Encrypted token not found' });
  } catch (e) {
    return res.status(500).json({ error: 'Error checking encrypted token' });
  }
}
