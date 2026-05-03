const Listing = require('../models/Listing');
const Blog    = require('../models/Blog');

const SITE      = process.env.SITE_URL || 'https://saashub.in';
const OG_IMAGE  = `${SITE}/og-image.png`;
const SITE_NAME = 'SaaSHub';

// Known crawler user-agents
const BOT_RE = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|applebot|semrushbot|ahrefsbot|msnbot|ia_archiver|rogerbot|embedly/i;

function isBot(req) {
  return BOT_RE.test(req.headers['user-agent'] || '');
}

function buildHtml({ title, description, keywords = '', image = OG_IMAGE, url, type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — India's #1 SaaS & White-Label Software Marketplace`;
  const pageUrl   = url ? `${SITE}${url}` : SITE;
  const ldStr     = jsonLd ? JSON.stringify(jsonLd) : null;

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}"/>
  ${keywords ? `<meta name="keywords" content="${esc(keywords)}"/>` : ''}
  <link rel="canonical" href="${esc(pageUrl)}"/>
  <meta name="robots" content="index, follow"/>
  <meta name="geo.region" content="IN"/>
  <meta name="geo.placename" content="India"/>
  <meta name="language" content="en-IN"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta property="og:title" content="${esc(fullTitle)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:image" content="${esc(image)}"/>
  <meta property="og:url" content="${esc(pageUrl)}"/>
  <meta property="og:type" content="${type}"/>
  <meta property="og:locale" content="en_IN"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:site" content="@saashubindia"/>
  <meta name="twitter:title" content="${esc(fullTitle)}"/>
  <meta name="twitter:description" content="${esc(description)}"/>
  <meta name="twitter:image" content="${esc(image)}"/>
  ${ldStr ? `<script type="application/ld+json">${ldStr}</script>` : ''}
</head>
<body>
  <h1>${esc(fullTitle)}</h1>
  <p>${esc(description)}</p>
  <p><a href="${SITE}">Back to ${SITE_NAME}</a></p>
</body>
</html>`;
}

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Route handlers ─────────────────────────────────────────────────────────

async function renderListing(req, res, slug) {
  const listing = await Listing.findOne({ slug, status: 'active' })
    .select('productName tagline shortDescription category additionalCategories logo screenshots listingType startingPrice currency slug keyFeatures rating')
    .lean();
  if (!listing) return false;

  const isWL   = listing.listingType === 'whitelabel';
  const image  = listing.logo || listing.screenshots?.[0] || OG_IMAGE;
  const desc   = listing.shortDescription ||
    `${listing.productName} is a ${isWL ? 'white-label' : 'SaaS'} ${listing.category} solution${listing.startingPrice ? ` starting at ${listing.currency || 'INR'} ${listing.startingPrice}` : ''}. ${listing.tagline || ''} Available on SaaSHub — India's #1 software marketplace.`;
  const keywords = [
    listing.productName,
    `${listing.productName} India`,
    `buy ${listing.productName}`,
    listing.category,
    `${listing.category} software India`,
    isWL ? `white label ${listing.category} India` : `${listing.category} SaaS India`,
    isWL ? 'white label software India' : 'SaaS software India',
    ...(listing.additionalCategories || []).map(c => `${c} software India`),
    ...(listing.keyFeatures || []).slice(0, 5),
    'verified software vendor India', 'SaaS marketplace India', 'software marketplace India',
  ].filter(Boolean).join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: listing.productName,
    description: desc,
    applicationCategory: 'BusinessApplication',
    url: `${SITE}/listings/${listing.slug}`,
    image,
    ...(listing.startingPrice && {
      offers: { '@type': 'Offer', price: listing.startingPrice, priceCurrency: listing.currency || 'INR', availability: 'https://schema.org/InStock' },
    }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Browse', item: `${SITE}/listings` },
        { '@type': 'ListItem', position: 3, name: listing.category, item: `${SITE}/listings?category=${encodeURIComponent(listing.category)}` },
        { '@type': 'ListItem', position: 4, name: listing.productName, item: `${SITE}/listings/${listing.slug}` },
      ],
    },
  };

  res.set('Content-Type', 'text/html; charset=utf-8').send(buildHtml({
    title: `${listing.productName} — ${listing.tagline || listing.category + ' Software'}`,
    description: desc,
    keywords,
    image,
    url: `/listings/${listing.slug}`,
    jsonLd,
  }));
  return true;
}

async function renderBlog(req, res, slug) {
  const post = await Blog.findOne({ slug, status: 'published' })
    .populate('author', 'name')
    .select('title slug excerpt category tags keywords metaTitle metaDescription coverImage author publishedAt updatedAt readTime')
    .lean();
  if (!post) return false;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage || OG_IMAGE,
    url: `${SITE}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author?.name || 'SaaSHub Team' },
    publisher: { '@type': 'Organization', name: 'SaaSHub', logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
    keywords: (post.keywords?.length ? post.keywords : post.tags || []).join(', '),
    articleSection: post.category,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE}/blog/${post.slug}` },
      ],
    },
  };

  res.set('Content-Type', 'text/html; charset=utf-8').send(buildHtml({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || `Read ${post.title} on the SaaSHub Blog.`,
    keywords: (post.keywords?.length ? post.keywords : post.tags || []).join(', '),
    image: post.coverImage || OG_IMAGE,
    url: `/blog/${post.slug}`,
    type: 'article',
    jsonLd,
  }));
  return true;
}

// ── Main middleware ─────────────────────────────────────────────────────────

module.exports = async function botRenderer(req, res, next) {
  // Only intercept GET requests from known bots for public pages
  if (req.method !== 'GET' || !isBot(req) || req.path.startsWith('/api/')) return next();

  try {
    const path = req.path;

    // /listings/:slug
    const listingMatch = path.match(/^\/listings\/([^/]+)$/);
    if (listingMatch) {
      const handled = await renderListing(req, res, listingMatch[1]);
      if (handled) return;
    }

    // /blog/:slug
    const blogMatch = path.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      const handled = await renderBlog(req, res, blogMatch[1]);
      if (handled) return;
    }

    // Static pages — serve pre-built SEO HTML
    if (path === '/' || path === '') {
      return res.set('Content-Type', 'text/html; charset=utf-8').send(buildHtml({
        title: "Buy & Sell SaaS & White-Label Software India — #1 Marketplace | SaaSHub",
        description: "India's #1 marketplace to buy and sell SaaS software and white-label solutions. 500+ verified products — CRM, ERP, HR, AI, restaurant, gym, booking software and more. Free to list. Zero commission.",
        keywords: "SaaS marketplace India, white label software India, buy SaaS software India, sell SaaS software India, white label software marketplace, B2B SaaS marketplace India, verified SaaS vendors India, Indian SaaS products, software reseller India, white label CRM India, white label ERP India, restaurant software India, gym software India, AI software India, WhatsApp marketing software India, booking software India, SaaS platform India, enterprise software India, cloud software India",
        url: '/',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE,
          potentialAction: { '@type': 'SearchAction', target: `${SITE}/listings?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
        },
      }));
    }

    if (path === '/listings') {
      return res.set('Content-Type', 'text/html; charset=utf-8').send(buildHtml({
        title: 'Buy SaaS & White-Label Software India — 500+ Verified Products | SaaSHub',
        description: 'Browse 500+ verified SaaS products and white-label software from trusted Indian vendors. CRM, ERP, HR, restaurant, gym, AI, booking software and more. Zero commission on enquiries.',
        keywords: 'buy SaaS software India, white label software India, SaaS marketplace India, B2B software marketplace India, verified SaaS vendors India, software reseller India, cloud software India, enterprise software India, white label CRM India, white label ERP India, restaurant management software India, gym management software India, booking software India, AI software India',
        url: '/listings',
      }));
    }

    if (path === '/blog') {
      return res.set('Content-Type', 'text/html; charset=utf-8').send(buildHtml({
        title: 'SaaSHub Blog — SaaS Insights, White-Label Guides & India Tech Trends',
        description: 'Expert articles on SaaS growth, white-label software strategies, B2B sales, and Indian tech ecosystem insights. Guides for SaaS founders, resellers and buyers in India.',
        keywords: 'SaaS blog India, white label software guide, B2B SaaS insights India, SaaS growth strategies, Indian SaaS industry, software reseller guide India, white label software tips, SaaS founder India',
        url: '/blog',
      }));
    }
  } catch (err) {
    console.error('[botRenderer] error:', err.message);
  }

  next();
};
