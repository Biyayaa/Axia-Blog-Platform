const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const cloudinary = require("cloudinary").v2;

// Promote user to admin
exports.promoteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.status(200).json({ message: `${user.name} is now an admin.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete any comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    await Comment.findByIdAndDelete(commentId);

    // Remove the comment reference from the post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
