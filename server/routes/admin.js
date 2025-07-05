import express from 'express';
import Festival from '../models/Festival.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.subscription.plan !== 'enterprise') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all festivals (admin only)
router.get('/festivals', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const festivals = await Festival.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'email businessProfile.name');

    const total = await Festival.countDocuments(query);

    res.json({
      festivals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin festivals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create festival (admin only)
router.post('/festivals', requireAdmin, async (req, res) => {
  try {
    const festivalData = {
      ...req.body,
      createdBy: req.user._id
    };

    const festival = new Festival(festivalData);
    await festival.save();

    res.status(201).json(festival);
  } catch (error) {
    console.error('Create festival error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update festival (admin only)
router.put('/festivals/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const festival = await Festival.findByIdAndUpdate(id, updates, { new: true });
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    res.json(festival);
  } catch (error) {
    console.error('Update festival error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete festival (admin only)
router.delete('/festivals/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const festival = await Festival.findByIdAndDelete(id);
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    res.json({ message: 'Festival deleted successfully' });
  } catch (error) {
    console.error('Delete festival error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;