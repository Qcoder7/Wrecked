export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { enctoken } = req.body;
  if (!enctoken) return res.status(400).json({ error: 'Encrypted token required' });

  const btoa = (str) => Buffer.from(str.toString(), 'binary').toString('base64');
  const redirect = `https://wrecked.vercel.app/entercode?=${encodeURIComponent(enctoken)}`;

  const linkvertise = `https://link-to.net/991963/${Math.floor(Math.random() * 1000)}/dynamic?r=${btoa(redirect)}`;

  return res.status(200).json({ link: linkvertise });
}
