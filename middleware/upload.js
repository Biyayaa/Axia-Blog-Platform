const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({ storage });

module.exports = upload;
