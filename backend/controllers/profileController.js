const User = require('../models/User'); // Adjust the path according to your project structure 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads' directory exists in the project directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to 'uploads' inside project directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Define the multer upload configuration with file validation
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and AVIF are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
}).single('profilePic'); // Field name should match 'profilePic' in the form

// Controller function to update profile (including profile picture)
const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, status, role } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user information
    user.name = name || user.name;
    user.email = email || user.email;
    user.status = status || user.status;
    user.role = role || user.role;

    // If a profile picture is uploaded, update the user's profilePic field
    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`; // Save relative path
    }

    await user.save(); // Save the updated user document

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Controller function to upload the profile picture only
const uploadProfilePic = (req, res, next) => {
  console.log('Uploading profile pic for user:', req.params.userId);
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next(); // Proceed to the next middleware (updateProfile)
  });
};

module.exports = { updateProfile, upload: uploadProfilePic };
