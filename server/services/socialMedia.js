import { TwitterApi } from 'twitter-api-v2';

export const publishToTwitter = async (post) => {
  try {
    const user = post.user;
    if (!user.socialAccounts.twitter.connected) {
      throw new Error('Twitter account not connected');
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: user.socialAccounts.twitter.accessToken,
      accessSecret: user.socialAccounts.twitter.accessTokenSecret,
    });

    const tweet = await client.v2.tweet({
      text: `${post.content.caption}\n\n${post.content.hashtags.join(' ')}`
    });

    return { id: tweet.data.id, platform: 'twitter' };
  } catch (error) {
    console.error('Twitter publish error:', error);
    throw error;
  }
};

export const publishToInstagram = async (post) => {
  try {
    const user = post.user;
    if (!user.socialAccounts.instagram.connected) {
      throw new Error('Instagram account not connected');
    }

    // Instagram Basic Display API implementation
    // This would require proper Instagram Business API setup
    const response = await fetch(`https://graph.instagram.com/v18.0/${user.socialAccounts.instagram.userId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: post.content.generatedImages[0], // Use first generated image
        caption: `${post.content.caption}\n\n${post.content.hashtags.join(' ')}`,
        access_token: user.socialAccounts.instagram.accessToken
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Instagram publish failed');
    }

    // Publish the media
    const publishResponse = await fetch(`https://graph.instagram.com/v18.0/${user.socialAccounts.instagram.userId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: data.id,
        access_token: user.socialAccounts.instagram.accessToken
      })
    });

    const publishData = await publishResponse.json();
    
    return { id: publishData.id, platform: 'instagram' };
  } catch (error) {
    console.error('Instagram publish error:', error);
    throw error;
  }
};