import cron from 'node-cron';
import Post from '../models/Post.js';
import { publishToTwitter, publishToInstagram } from './socialMedia.js';
import { sendNotification } from './notifications.js';

let schedulerInitialized = false;

export const initializeScheduler = (io) => {
  if (schedulerInitialized) return;
  
  // Run every minute to check for posts to publish
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const postsToPublish = await Post.find({
        status: 'scheduled',
        scheduledDate: { $lte: now }
      }).populate('user festival');

      for (const post of postsToPublish) {
        await publishPost(post, io);
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  schedulerInitialized = true;
  console.log('Post scheduler initialized');
};

const publishPost = async (post, io) => {
  try {
    post.status = 'posting';
    await post.save();

    const results = [];

    for (const platform of post.platforms) {
      try {
        let result;
        if (platform === 'twitter') {
          result = await publishToTwitter(post);
        } else if (platform === 'instagram') {
          result = await publishToInstagram(post);
        }

        results.push({
          platform,
          success: true,
          postId: result.id,
          publishedAt: new Date()
        });
      } catch (error) {
        console.error(`Failed to publish to ${platform}:`, error);
        results.push({
          platform,
          success: false,
          error: error.message,
          publishedAt: new Date()
        });
      }
    }

    post.publishResults = results;
    post.status = results.some(r => r.success) ? 'posted' : 'failed';
    await post.save();

    // Send real-time notification
    io.to(`user-${post.user._id}`).emit('post-published', {
      postId: post._id,
      status: post.status,
      results
    });

    // Send email notification
    await sendNotification(post.user, 'post-published', {
      postTitle: `${post.festival.name} post`,
      status: post.status,
      platforms: post.platforms
    });

  } catch (error) {
    console.error('Publish post error:', error);
    post.status = 'failed';
    await post.save();
  }
};

export const schedulePost = async (postData) => {
  try {
    const post = new Post(postData);
    await post.save();
    return post;
  } catch (error) {
    console.error('Schedule post error:', error);
    throw error;
  }
};