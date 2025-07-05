import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    festival: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: false,
    },
    content: {
      caption: {
        type: String,
        required: true,
      },
      hashtags: [String],
      imagePrompts: [String],
      selectedImagePrompt: String,
      generatedImages: [String],
    },
    platforms: [
      {
        type: String,
        enum: ["twitter", "instagram"],
      },
    ],
    scheduledDate: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "posted", "failed"],
      default: "draft",
    },
    publishResults: [
      {
        platform: String,
        success: Boolean,
        postId: String,
        error: String,
        publishedAt: Date,
      },
    ],
    analytics: {
      twitter: {
        likes: Number,
        retweets: Number,
        replies: Number,
        impressions: Number,
      },
      instagram: {
        likes: Number,
        comments: Number,
        shares: Number,
        reach: Number,
      },
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ user: 1, scheduledDate: 1, status: 1 });

export default mongoose.model("Post", postSchema);
