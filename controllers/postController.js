const Post = require('../models/post');
const slugify = require('../utils/slugify');
const Comment = require('../models/comment');
const cloudinary = require('cloudinary').v2;

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;
    const slug = slugify(title);

    // Check if slug already exists
    const existing = await Post.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Post with this title already exists' });
    }

    let imageData = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blog_posts'
      });

      imageData = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    // Create post object
    const post = await Post.create ({
      title,
      slug,
      content,
      tags,
      status: status || 'draft',
      author: req.user.id,
      image: imageData
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
    const postId = req.params.id;
    const post = await Post.findById(postId);
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
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove image from Cloudinary if it exists
    if (post.image) {
      const publicId = post.image.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error('Cloudinary deletion error:', cloudErr);
      }
    }

    // Delete the post
    await post.deleteOne();

    // Delete related comments
    await Comment.deleteMany({ post: postId });

    res.status(200).json({ message: 'Post, related comments, and image (if any) deleted successfully' });
  } catch (err) {
    console.error('Post deletion error:', err);
    res.status(500).json({ error: err.message });
  }
};
