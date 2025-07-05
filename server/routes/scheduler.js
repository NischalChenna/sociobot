import express from "express";
import Post from "../models/Post.js";
import Festival from "../models/Festival.js";
import { schedulePost } from "../services/scheduler.js";

const router = express.Router();

// Schedule a post
router.post("/schedule", async (req, res) => {
  try {
    const { festivalId, content, platforms, scheduledDate, timezone } =
      req.body;

    console.log("Received schedule request:", {
      festivalId,
      platforms,
      scheduledDate,
      timezone,
    });

    let festival = null;

    // Handle festival reference
    if (festivalId) {
      // Check if it's a valid ObjectId
      if (festivalId.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a valid ObjectId, try to find the festival
        festival = await Festival.findById(festivalId);
        console.log(
          "Found existing festival:",
          festival ? festival.name : "not found"
        );
      } else {
        // It's a mock ID, create a festival from the content or use null
        if (content.festival) {
          console.log(
            "Creating new festival from content:",
            content.festival.name
          );
          // Create a new festival from the content
          festival = new Festival({
            name: content.festival.name,
            date: new Date(content.festival.date),
            type: content.festival.type,
            description: content.festival.description,
            // Don't set both regions and relevantIndustries to avoid parallel array indexing issue
            relevantIndustries: ["general"], // Default
            createdBy: req.user._id,
          });
          await festival.save();
          console.log("Created new festival with ID:", festival._id);
        }
      }
    }

    const postData = {
      user: req.user._id,
      festival: festival ? festival._id : undefined,
      content,
      platforms,
      scheduledDate: new Date(scheduledDate),
      timezone,
      status: "scheduled",
    };

    console.log("Creating post with data:", {
      user: postData.user,
      festival: postData.festival,
      platforms: postData.platforms,
      status: postData.status,
    });

    const post = await schedulePost(postData);
    if (festival) {
      await post.populate("festival");
    }

    console.log("Successfully created post:", post._id);
    res.status(201).json(post);
  } catch (error) {
    console.error("Schedule post error:", error);
    res
      .status(500)
      .json({ message: "Failed to schedule post", error: error.message });
  }
});

// Get scheduled posts
router.get("/posts", async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const posts = await Post.find(query)
      .populate("festival")
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update scheduled post
router.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Post.findOne({ _id: id, user: req.user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.status === "posted") {
      return res.status(400).json({ message: "Cannot update posted content" });
    }

    Object.assign(post, updates);
    await post.save();
    await post.populate("festival");

    res.json(post);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete scheduled post
router.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, user: req.user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.status === "posted") {
      return res.status(400).json({ message: "Cannot delete posted content" });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
