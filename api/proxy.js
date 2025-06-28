// /api/proxy.js
import fetch from 'node-fetch';
import { setCorsHeaders } from './cors.utils.js';

export const config = {
  api: {
    responseLimit: false, // permite respostas grandes (vídeos)
  },
};

export default async function handler(req, res) {
  setCorsHeaders(res)
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing download URL' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'Falha ao buscar vídeo do TikMate' });
    }

    // Transmitir como streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=\"video.mp4\"');

    response.body.pipe(res);
  } catch (error) {
    console.error('Erro no proxy de vídeo:', error);
    return res.status(500).json({ error: 'Erro interno no proxy' });
  }
}
