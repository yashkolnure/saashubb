const router = require('express').Router();
const Listing = require('../models/Listing');
const Blog = require('../models/Blog');

const SITE = process.env.FRONTEND_URL || 'https://onlinesaasmarketplace.com';

const urlEntry = (loc, { lastmod, changefreq = 'weekly', priority = '0.5' } = {}) => `
  <url>
    <loc>${SITE}${loc}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [listings, posts] = await Promise.all([
      Listing.find({ status: 'active' }).select('slug updatedAt').lean(),
      Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    const urls = [
      urlEntry('/',                   { changefreq: 'daily',   priority: '1.0' }),
      urlEntry('/listings',           { changefreq: 'hourly',  priority: '0.9' }),
      urlEntry('/blog',               { changefreq: 'daily',   priority: '0.8' }),
      urlEntry('/register/seller',    { changefreq: 'monthly', priority: '0.7' }),
      urlEntry('/register/buyer',     { changefreq: 'monthly', priority: '0.6' }),
      urlEntry('/login',              { changefreq: 'monthly', priority: '0.4' }),
      ...listings.map(l => urlEntry(`/listings/${l.slug}`, { lastmod: l.updatedAt, changefreq: 'weekly',  priority: '0.8' })),
      ...posts.map(b =>    urlEntry(`/blog/${b.slug}`,     { lastmod: b.updatedAt, changefreq: 'monthly', priority: '0.7' })),
    ];

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('')}
</urlset>`);
  } catch (err) {
    res.status(500).send('Sitemap generation failed');
  }
});

module.exports = router;
