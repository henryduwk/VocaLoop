import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(503).json({ error: 'sync_not_configured' });
  }

  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  const syncKey = req.method === 'GET' ? req.query.key : req.body?.key;

  if (!syncKey || syncKey.length < 4) {
    return res.status(400).json({ error: 'Sync key must be at least 4 characters' });
  }

  try {
    if (req.method === 'GET') {
      const data = await redis.get(`sync:${syncKey}`);
      return res.status(200).json({ data: data || null });
    }

    if (req.method === 'POST') {
      const { decks, words, timestamp } = req.body;
      await redis.set(`sync:${syncKey}`, { decks, words, timestamp });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: 'Sync failed' });
  }
}
