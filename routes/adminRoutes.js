const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // renamed middleware
const { isAdmin } = require('../middleware/roles');
const {
  promoteUser,
  deleteComment,
  deletePost
} = require('../controllers/adminController');

// ✅ Only admins can access these routes
router.use(auth, isAdmin);

// Promote a regular user to admin
router.post('/promote/:userId', promoteUser);

// Delete any comment
router.delete('/comments/:commentId', deleteComment);

// // Edit any post
// router.put('/posts/:postId', editPostAsAdmin);

// Delete any post
router.delete('/posts/:postId', deletePost);

module.exports = router;
