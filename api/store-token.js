export const config = {
  runtime: 'edge',
};

import { put } from '@vercel/blob';
import crypto from 'crypto';

export default async function handler(req) {
  try {
    const { token } = await req.json(); // ✅ parse the request body manually

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });
    }

    const enctoken = crypto.createHash('sha256').update(token).digest('hex');

    const data = {
      token,
      status: 'unused',
      ip: '',
      enctoken
    };

    await put(`tokens/${enctoken}.json`, JSON.stringify(data), {
      access: 'public'
    });

    return new Response(JSON.stringify({ success: true, enctoken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
