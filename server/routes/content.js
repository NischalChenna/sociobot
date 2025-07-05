import express from "express";
import {
  generateContent,
  generateImages,
} from "../services/contentGeneration.js";
import imageGenerationService from "../services/imageGeneration.js";
import freeImageGenerationService from "../services/freeImageGeneration.js";
import Festival from "../models/Festival.js";

const router = express.Router();

// Generate content for festival
router.post("/generate", async (req, res) => {
  try {
    const { festivalId, customPrompt } = req.body;
    const user = req.user;

    const festival = await Festival.findById(festivalId);
    if (!festival) {
      return res.status(404).json({ message: "Festival not found" });
    }

    const content = await generateContent(
      user.businessProfile,
      festival,
      customPrompt
    );

    res.json(content);
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ message: "Failed to generate content" });
  }
});

// Generate images
router.post("/generate-images", async (req, res) => {
  try {
    const { prompts } = req.body;

    if (!prompts || !Array.isArray(prompts)) {
      return res.status(400).json({ message: "Invalid prompts provided" });
    }

    const images = await generateImages(prompts);

    res.json({ images });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ message: "Failed to generate images" });
  }
});

// Regenerate content
router.post("/regenerate", async (req, res) => {
  try {
    const { festivalId, type, customPrompt } = req.body;
    const user = req.user;

    const festival = await Festival.findById(festivalId);
    if (!festival) {
      return res.status(404).json({ message: "Festival not found" });
    }

    let content;
    if (type === "caption") {
      content = await generateContent(
        user.businessProfile,
        festival,
        customPrompt
      );
    } else if (type === "images") {
      const baseContent = await generateContent(user.businessProfile, festival);
      content = await generateImages(baseContent.imagePrompts);
    }

    res.json(content);
  } catch (error) {
    console.error("Content regeneration error:", error);
    res.status(500).json({ message: "Failed to regenerate content" });
  }
});

// Generate marketing images
router.post("/generate-marketing-images", async (req, res) => {
  try {
    const { businessProfile, content } = req.body;

    if (!businessProfile || !content) {
      return res.status(400).json({
        message: "Business profile and content are required",
      });
    }

    console.log("🎨 Starting RAG-powered image generation...");
    console.log(
      "Business Profile:",
      businessProfile.name,
      businessProfile.industry
    );
    console.log("Festival:", content.festival?.name);

    const result = await imageGenerationService.generateMarketingImages(
      businessProfile,
      content
    );

    if (result.success) {
      console.log("✅ Generated", result.images.length, "marketing images");
      res.json(result);
    } else {
      console.error("❌ Image generation failed:", result.error);
      res.status(500).json({
        message: "Failed to generate images",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      message: "Failed to generate images",
      error: error.message,
    });
  }
});

// Regenerate individual marketing image
router.post("/regenerate-marketing-image", async (req, res) => {
  try {
    const { businessProfile, content, imageType, originalPrompt } = req.body;

    if (!businessProfile || !content || !imageType) {
      return res.status(400).json({
        message: "Business profile, content, and image type are required",
      });
    }

    console.log(`🔄 Regenerating ${imageType} image...`);

    const result = await imageGenerationService.regenerateImage(
      businessProfile,
      content,
      imageType,
      originalPrompt
    );

    if (result.success) {
      console.log("✅ Regenerated image successfully");
      res.json(result);
    } else {
      console.error("❌ Image regeneration failed:", result.error);
      res.status(500).json({
        message: "Failed to regenerate image",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Image regeneration error:", error);
    res.status(500).json({
      message: "Failed to regenerate image",
      error: error.message,
    });
  }
});

// Generate free marketing images (no cost)
router.post("/generate-free-marketing-images", async (req, res) => {
  try {
    const { businessProfile, content } = req.body;

    if (!businessProfile || !content) {
      return res.status(400).json({
        message: "Business profile and content are required",
      });
    }

    console.log("🎨 Starting FREE image generation...");
    console.log(
      "Business Profile:",
      businessProfile.name,
      businessProfile.industry
    );
    console.log("Festival:", content.festival?.name);

    const result = await freeImageGenerationService.generateMarketingImages(
      businessProfile,
      content
    );

    if (result.success) {
      console.log(
        "✅ Generated",
        result.images.length,
        "free marketing images"
      );
      res.json(result);
    } else {
      console.error("❌ Free image generation failed:", result.error);
      res.status(500).json({
        message: "Failed to generate free images",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Free image generation error:", error);
    res.status(500).json({
      message: "Failed to generate free images",
      error: error.message,
    });
  }
});

// Regenerate individual free marketing image
router.post("/regenerate-free-marketing-image", async (req, res) => {
  try {
    const { businessProfile, content, imageType, originalPrompt } = req.body;

    if (!businessProfile || !content || !imageType) {
      return res.status(400).json({
        message: "Business profile, content, and image type are required",
      });
    }

    console.log(`🔄 Regenerating free ${imageType} image...`);

    const result = await freeImageGenerationService.regenerateImage(
      businessProfile,
      content,
      imageType,
      originalPrompt
    );

    if (result.success) {
      console.log("✅ Regenerated free image successfully");
      res.json(result);
    } else {
      console.error("❌ Free image regeneration failed:", result.error);
      res.status(500).json({
        message: "Failed to regenerate free image",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Free image regeneration error:", error);
    res.status(500).json({
      message: "Failed to regenerate free image",
      error: error.message,
    });
  }
});

// Test image generation with simple prompt
router.post("/test-image-generation", async (req, res) => {
  try {
    console.log("🧪 Testing image generation...");

    // Try multiple simple prompts
    const testPrompts = [
      "A simple restaurant logo with clean typography",
      "Restaurant dining room with warm lighting",
      "Beautiful food on white plates",
      "Professional kitchen equipment",
      "Simple graphic design with text",
    ];

    const results = [];

    for (let i = 0; i < testPrompts.length; i++) {
      try {
        console.log(`🧪 Testing prompt ${i + 1}: ${testPrompts[i]}`);

        const imageResponse =
          await imageGenerationService.openai.images.generate({
            model: "dall-e-3",
            prompt: testPrompts[i],
            size: "1024x1024",
            quality: "standard",
            style: "natural",
            n: 1,
          });

        const imageUrl = imageResponse.data[0].url;
        results.push({ prompt: testPrompts[i], success: true, url: imageUrl });
        console.log(`✅ Test ${i + 1} successful: ${imageUrl}`);

        // Wait between requests
        if (i < testPrompts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Test ${i + 1} failed:`, error.message);
        results.push({
          prompt: testPrompts[i],
          success: false,
          error: error.message,
        });
      }
    }

    const successfulTests = results.filter((r) => r.success);
    console.log(
      `✅ ${successfulTests.length}/${results.length} tests successful`
    );

    res.json({
      success: successfulTests.length > 0,
      results,
      message: `${successfulTests.length}/${results.length} test images generated successfully`,
    });
  } catch (error) {
    console.error("Test image generation error:", error);
    res.status(500).json({
      success: false,
      message: "Test image generation failed",
      error: error.message,
    });
  }
});

export default router;
