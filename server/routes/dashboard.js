import express from 'express';
import Post from '../models/Post.js';
import Festival from '../models/Festival.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalPosts,
      scheduledPosts,
      postedPosts,
      failedPosts,
      upcomingFestivals
    ] = await Promise.all([
      Post.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId, status: 'scheduled' }),
      Post.countDocuments({ user: userId, status: 'posted' }),
      Post.countDocuments({ user: userId, status: 'failed' }),
      Festival.countDocuments({ 
        date: { $gte: new Date() },
        isActive: true 
      })
    ]);

    res.json({
      totalPosts,
      scheduledPosts,
      postedPosts,
      failedPosts,
      upcomingFestivals
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const recentPosts = await Post.find({ user: userId })
      .populate('festival', 'name date type')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('content.caption status scheduledDate platforms publishResults createdAt');

    res.json(recentPosts);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics summary
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const posts = await Post.find({
      user: userId,
      status: 'posted',
      'publishResults.publishedAt': { $gte: startDate }
    }).select('analytics publishResults platforms');

    const analytics = {
      totalEngagement: 0,
      platformBreakdown: {
        twitter: { posts: 0, engagement: 0 },
        instagram: { posts: 0, engagement: 0 }
      },
      topPerformingPosts: []
    };

    posts.forEach(post => {
      post.platforms.forEach(platform => {
        analytics.platformBreakdown[platform].posts++;
        
        if (post.analytics && post.analytics[platform]) {
          const engagement = platform === 'twitter' 
            ? (post.analytics.twitter.likes || 0) + (post.analytics.twitter.retweets || 0)
            : (post.analytics.instagram.likes || 0) + (post.analytics.instagram.comments || 0);
          
          analytics.platformBreakdown[platform].engagement += engagement;
          analytics.totalEngagement += engagement;
        }
      });
    });

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;