const express = require('express');
const router = express.Router();
const {addComment, deleteComment} = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/:postId', auth, addComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;