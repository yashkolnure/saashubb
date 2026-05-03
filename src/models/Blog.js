const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  slug:            { type: String, unique: true, lowercase: true },
  excerpt:         { type: String, maxlength: 400 },
  content:         { type: String, required: true },
  coverImage:      String,
  author:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags:            [String],
  category:        { type: String, default: 'Insights' },
  status:          { type: String, enum: ['draft', 'published'], default: 'draft' },
  metaTitle:       { type: String, maxlength: 70 },
  metaDescription: { type: String, maxlength: 160 },
  keywords:        [String],
  readTime:        Number,
  views:           { type: Number, default: 0 },
  featured:        { type: Boolean, default: false },
  publishedAt:     Date,
}, { timestamps: true });

blogSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified('content')) {
    const words = this.content.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
    this.readTime = Math.max(1, Math.round(words / 200));
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
