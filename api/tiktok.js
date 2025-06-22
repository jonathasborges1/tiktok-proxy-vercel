import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight por 1 dia
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let rawData = '';
    req.on('data', (chunk) => (rawData += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // ✅ Responder preflight antes de qualquer leitura do body
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { url } = body;

    const form = new FormData();
    form.append('url', url);

    const response = await fetch('https://api.tikmate.app/api/lookup', {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        origin: 'https://tikmate.app',
      },
      body: form,
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro no proxy', detail: err.message });
  }
}