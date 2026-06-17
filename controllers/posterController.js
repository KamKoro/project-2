const express = require('express');
const router = express.Router();

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapTitle(title, maxCharsPerLine = 14) {
  const words = String(title || 'Film').split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

router.get('/posters/generate', (req, res) => {
  const title = req.query.title || 'Film';
  const lines = wrapTitle(title);
  const lineHeight = 28;
  const startY = 200 - ((lines.length - 1) * lineHeight) / 2;
  const textLines = lines
    .map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="150" y="${y}" text-anchor="middle" class="title">${escapeXml(line)}</text>`;
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450" role="img" aria-label="${escapeXml(title)} poster">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1720"/>
      <stop offset="100%" stop-color="#0a0a0b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0c75e"/>
      <stop offset="100%" stop-color="#9a7b2c"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg)"/>
  <rect x="12" y="12" width="276" height="426" fill="none" stroke="url(#gold)" stroke-width="3" rx="4"/>
  <rect x="24" y="36" width="252" height="300" fill="#242029" rx="2"/>
  <circle cx="150" cy="170" r="42" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.5"/>
  <polygon points="142,155 142,185 168,170" fill="#d4af37" opacity="0.85"/>
  ${textLines}
  <text x="150" y="400" text-anchor="middle" class="label">SCENE IT</text>
  <style>
    .title { fill: #f3ece0; font-family: Georgia, serif; font-size: 22px; font-weight: 700; }
    .label { fill: #d4af37; font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 0.25em; }
  </style>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

module.exports = router;
