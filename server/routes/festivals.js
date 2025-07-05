import express from 'express';
import Festival from '../models/Festival.js';

const router = express.Router();

// Get upcoming festivals
router.get('/upcoming', async (req, res) => {
  try {
    const { industry, region, limit = 10 } = req.query;
    const user = req.user;

    const query = {
      date: { $gte: new Date() },
      isActive: true
    };

    if (industry) {
      query.relevantIndustries = { $in: [industry, 'general'] };
    }

    if (region) {
      query.$or = [
        { regions: { $in: [region] } },
        { countries: { $in: [region] } }
      ];
    }

    const festivals = await Festival.find(query)
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json(festivals);
  } catch (error) {
    console.error('Get festivals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get festival by ID
router.get('/:id', async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }
    res.json(festival);
  } catch (error) {
    console.error('Get festival error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add custom festival
router.post('/custom', async (req, res) => {
  try {
    const { name, date, type, description, regions } = req.body;
    
    const festival = new Festival({
      name,
      date,
      type,
      description,
      regions: regions || [],
      relevantIndustries: ['general'],
      createdBy: req.user.userId,
      importance: 'medium'
    });

    await festival.save();
    res.status(201).json(festival);
  } catch (error) {
    console.error('Create custom festival error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;