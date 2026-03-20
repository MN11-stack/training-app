// Vercel Serverless Function – Upstash Redis Sync
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd, ...args) {
  const res = await fetch(`${UPSTASH_URL}/${[cmd, ...args].join('/')}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
  });
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.method === 'GET' ? req.query : req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // POST – Daten speichern
  if (req.method === 'POST') {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Missing data' });
    await redis('SET', `training:${id}`, encodeURIComponent(JSON.stringify(data)));
    return res.status(200).json({ ok: true });
  }

  // GET – Daten laden
  if (req.method === 'GET') {
    const result = await redis('GET', `training:${id}`);
    if (!result.result) return res.status(200).json({ data: null });
    return res.status(200).json({ data: JSON.parse(decodeURIComponent(result.result)) });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
