// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary'); // If using multer-storage-cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional: Configure storage for direct upload via multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'ai-ui-critic-uploads', // Optional folder name in Cloudinary
//     format: async (req, file) => 'png', // supports promises as well
//     public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
//   },
// });

// module.exports = { cloudinary, storage }; // If using storage
module.exports = cloudinary; // If uploading manually from buffer