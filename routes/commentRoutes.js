const express = require('express');
const router = express.Router();
const {addComment} = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/:postId', auth, addComment);

module.exports = router;