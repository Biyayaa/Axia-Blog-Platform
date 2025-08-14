const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const {deletePost} = require('../controllers/postController');
const {
  promoteUser,
  deleteComment
} = require('../controllers/adminController');

// ✅ Only admins can access these routes
router.use(auth, isAdmin);

// Promote a regular user to admin
router.post('/promote/:id', promoteUser);

// Delete any comment
router.delete('/comments/:id', deleteComment);

// Delete any post
router.delete('/posts/:id', deletePost);

module.exports = router;
