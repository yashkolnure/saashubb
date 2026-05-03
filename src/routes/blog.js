const router = require('express').Router();
const Blog = require('../models/Blog');
const slugify = require('slugify');
const { protect, requireRole } = require('../middleware/auth');
const { pingAsync } = require('../utils/indexNow'); // pings Google+Bing sitemap, no key needed

// ── Public: list published posts ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, featured } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (featured === 'true') filter.featured = true;

    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name')
        .sort({ featured: -1, publishedAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .select('-content'),
      Blog.countDocuments(filter),
    ]);

    const categories = await Blog.distinct('category', { status: 'published' });

    res.json({ posts, total, pages: Math.ceil(total / +limit), page: +page, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: list all posts including drafts ──────────────────────────────────
router.get('/admin/all', protect, requireRole('admin'), async (req, res) => {
  try {
    const posts = await Blog.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .select('-content');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: single post by slug ─────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Related posts (same category, exclude current)
    const related = await Blog.find({
      status: 'published',
      category: post.category,
      _id: { $ne: post._id },
    }).limit(3).select('title slug excerpt coverImage readTime publishedAt');

    res.json({ post, related });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: create post ──────────────────────────────────────────────────────
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const data = { ...req.body, author: req.user._id };
    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
    const post = await Blog.create(data);
    if (post.status === 'published') pingAsync([`/blog/${post.slug}`, '/blog']);
    res.status(201).json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Admin: update post ──────────────────────────────────────────────────────
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.status === 'published' && !update.publishedAt) {
      update.publishedAt = new Date();
    }
    const existing = await Blog.findById(req.params.id).select('status slug');
    const post = await Blog.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    // Ping if newly published or content updated while published
    if (update.status === 'published' || (existing?.status === 'published' && update.content)) {
      pingAsync([`/blog/${post.slug}`, '/blog']);
    }
    res.json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Admin: delete post ──────────────────────────────────────────────────────
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
