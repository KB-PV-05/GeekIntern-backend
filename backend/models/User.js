const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['Online', 'Offline', 'Lunch', 'Leave'], default: 'Offline' },
  role: { type: String, enum: ['Admin', 'Intern','Mentor'], default: 'Intern' },
  profilePic: { type: String, default: '' },
});

module.exports = mongoose.model('User', UserSchema);
