// This script generates PWA icons from SVG
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

const svgTemplate = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#grad)"/>
  <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.45)}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">MW</text>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svg = svgTemplate(size);
  const filename = path.join(__dirname, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

console.log('All icons generated!');