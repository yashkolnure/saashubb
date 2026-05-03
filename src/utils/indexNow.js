const https = require('https');

const SITE = process.env.SITE_URL || 'https://saashub.in';

// Ping Google + Bing to re-crawl the sitemap — no API key needed
async function pingSitemaps() {
  const encoded = encodeURIComponent(`${SITE}/sitemap.xml`);
  const targets = [
    { host: 'www.google.com', path: `/ping?sitemap=${encoded}` },
    { host: 'www.bing.com',   path: `/ping?sitemap=${encoded}` },
  ];
  for (const t of targets) {
    await new Promise((resolve) => {
      const req = https.request({ hostname: t.host, path: t.path, method: 'GET' }, (res) => {
        console.log(`[SEO ping] ${t.host} sitemap — ${res.statusCode}`);
        resolve();
      });
      req.on('error', (e) => { console.error(`[SEO ping] ${t.host} failed:`, e.message); resolve(); });
      req.end();
    });
  }
}

// Non-blocking fire-and-forget — never delays the API response
function pingAsync() {
  setImmediate(() => pingSitemaps().catch(() => {}));
}

module.exports = { pingSitemaps, pingAsync };
