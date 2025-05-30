const LINKVERTISE_USERID = 991963;

function btoa(str) {
  return Buffer.from(str.toString(), 'binary').toString('base64');
}

function linkvertise(userid, link) {
  const base_url = `https://link-to.net/${userid}/${Math.floor(Math.random() * 1000)}/dynamic`;
  return base_url + '?r=' + btoa(encodeURI(link));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { enctoken } = req.body;
    if (!enctoken) return res.status(400).json({ error: 'enctoken required' });

    const redirectLink = `https://wreckedgen.vercel.app/entercode?=${encodeURIComponent(enctoken)}`;
    const lvLink = linkvertise(LINKVERTISE_USERID, redirectLink);

    res.status(200).json({ link: lvLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
