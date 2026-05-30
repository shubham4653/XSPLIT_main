const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Setup two-way encryption for sensitive fields
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-secret-key-12345'; // Must be 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    // Use the first 32 characters of the key securely
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Encryption Error:', err);
    return text;
  }
}

function decrypt(text) {
  if (!text) return text;
  let textParts = text.split(':');
  // If it's not encrypted (old data), just return it
  if (textParts.length !== 2) return text;
  
  try {
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // If decryption fails (wrong key, etc), return the raw string to avoid crashing
    return text;
  }
}

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    select: false // Do not return password by default
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  upiId: {
    type: String,
    trim: true,
    get: decrypt,
    set: encrypt
  },
  profilePicture: { 
    type: String 
  },
  preferences: {
    currency: { type: String, default: 'USD' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    notifications: { 
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String
  },
  lastLogin: Date
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
