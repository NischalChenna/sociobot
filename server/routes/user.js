import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -verificationToken -resetPasswordToken');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { businessProfile, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (businessProfile) {
      user.businessProfile = { ...user.businessProfile, ...businessProfile };
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();
    
    const updatedUser = await User.findById(user._id).select('-password -verificationToken -resetPasswordToken');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect social media account
router.post('/connect-social', async (req, res) => {
  try {
    const { platform, accessToken, accessTokenSecret, username, userId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (platform === 'twitter') {
      user.socialAccounts.twitter = {
        accessToken,
        accessTokenSecret,
        username,
        connected: true
      };
    } else if (platform === 'instagram') {
      user.socialAccounts.instagram = {
        accessToken,
        userId,
        username,
        connected: true
      };
    }

    await user.save();
    res.json({ message: `${platform} connected successfully` });
  } catch (error) {
    console.error('Connect social error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disconnect social media account
router.post('/disconnect-social', async (req, res) => {
  try {
    const { platform } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (platform === 'twitter') {
      user.socialAccounts.twitter = {
        accessToken: '',
        accessTokenSecret: '',
        username: '',
        connected: false
      };
    } else if (platform === 'instagram') {
      user.socialAccounts.instagram = {
        accessToken: '',
        userId: '',
        username: '',
        connected: false
      };
    }

    await user.save();
    res.json({ message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Disconnect social error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;