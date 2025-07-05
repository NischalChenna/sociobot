import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  businessProfile: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    industry: {
      type: String,
      required: true,
      enum: ['food', 'retail', 'hospitality', 'fitness', 'general']
    },
    logo: String,
    timezone: {
      type: String,
      default: 'America/New_York'
    }
  },
  socialAccounts: {
    twitter: {
      accessToken: String,
      accessTokenSecret: String,
      username: String,
      connected: { type: Boolean, default: false }
    },
    instagram: {
      accessToken: String,
      userId: String,
      username: String,
      connected: { type: Boolean, default: false }
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    autoSchedule: { type: Boolean, default: false },
    preferredPostTimes: [String]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    postsRemaining: { type: Number, default: 10 }
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);