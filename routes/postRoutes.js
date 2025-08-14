const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost, getPosts, getPost, updatePost, deletePost
} = require('../controllers/postController');

const router = express.Router();

router.get('/', getPosts);
router.get('/:slug', getPost);
router.post('/', auth, [
  body('title').notEmpty(),
  body('content').notEmpty()
], upload.single('image'), createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
