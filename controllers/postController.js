const Post = require('../models/post');
const slugify = require('../utils/slugify');

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;
    const slug = slugify(title);

    const existing = await Post.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Post with this title already exists' });

    const post = await Post.create({
      title,
      slug,
      content,
      tags,
      status: status || 'draft',
      author: req.user.id
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find()
      .populate('author', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'name email' },
          { path: 'parent', select: 'content author' }
        ]
      })
      .populate('author', 'name email');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.title) post.slug = slugify(req.body.title);
    Object.assign(post, req.body);

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
