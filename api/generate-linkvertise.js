const LINKVERTISE_USERID = 991963;

function btoa(str) {
  return Buffer.from(str.toString(), 'binary').toString('base64');
}

function linkvertise(userid, link) {
  const base_url = `https://link-to.net/${userid}/${Math.floor(Math.random() * 1000)}/dynamic`;
  const href = base_url + '?r=' + btoa(encodeURI(link));
  return href;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { enctoken } = req.body;
    if (!enctoken) return res.status(400).json({ error: 'enctoken required' });

    // Create final link: wrecked.vercel.app/entercode?=enctoken
    const redirectLink = `https://wrecked.vercel.app/entercode?=${encodeURIComponent(enctoken)}`;

    // Generate linkvertise link
    const lvLink = linkvertise(LINKVERTISE_USERID, redirectLink);

    res.status(200).json({ link: lvLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
