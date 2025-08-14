const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

// Promote user to admin
exports.promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'admin';
    await user.save();

    res.status(200).json({ message: `${user.username} is now an admin.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete any post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await Post.findByIdAndDelete(req.params.postId);

    // Optional: also delete related comments
    await Comment.deleteMany({ post: req.params.postId });

    res.status(200).json({ message: 'Post and related comments deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete any comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await Comment.findByIdAndDelete(req.params.commentId);

    // Remove the comment reference from the post's comments array
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
