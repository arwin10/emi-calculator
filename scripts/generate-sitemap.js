const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'dist');
const SITE_URL = process.env.SITE_URL || 'https://calculateyouremi.in';

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.isFile() && (e.name.endsWith('.html') || e.name.endsWith('.htm'))) files.push(full);
  }
  return files;
}

function toUrl(filePath) {
  const rel = path.relative(BUILD_DIR, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return `${SITE_URL}/`;
  // remove .html and index.html from end
  let url = `${SITE_URL}/${rel}`;
  url = url.replace(/index\.html$/, '');
  url = url.replace(/\.html$/, '');
  return url.replace(/\/\/+$/, '');
}

if (!fs.existsSync(BUILD_DIR)) {
  console.error('Build directory not found:', BUILD_DIR);
  process.exit(1);
}

const htmlFiles = walk(BUILD_DIR);
const urls = Array.from(new Set(htmlFiles.map(toUrl)));

const now = new Date().toISOString();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${now}</lastmod></url>`).join('\n')}\n</urlset>`;

fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap, 'utf8');
console.log('Sitemap written to', path.join(BUILD_DIR, 'sitemap.xml'));
