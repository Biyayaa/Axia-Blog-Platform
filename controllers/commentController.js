const Comment = require('../models/comment');
const Post = require('../models/post');


exports.addComment = async (req, res) => {
    try{
        const {postId} = req.params;
        const {content, parentId} = req.body;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message: 'Post not found'});

        const comment = await Comment.create({
            post: postId,
            author: req.user.id,
            content,
            parent: parentId || null
        });

        // Attach comment to the post
    post.comments.push(comment._id);
    await post.save();

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({error: err.message});
    }
};