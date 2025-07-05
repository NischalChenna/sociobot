import OpenAI from "openai";
import FestivalDesignRAG from "./festivalRAG.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class ImageGenerationService {
  constructor() {
    this.openai = openai;
    this.ragAgent = new FestivalDesignRAG();

    // Test API key and DALL-E 3 access on startup
    this.testDALLE3Access();
  }

  async testDALLE3Access() {
    try {
      console.log("🧪 Testing DALL-E 3 access with ultra-simple prompt...");
      const testResponse = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: "A red circle",
        size: "1024x1024",
        quality: "standard",
        style: "natural",
        n: 1,
      });
      console.log("✅ DALL-E 3 test successful - API key has access");
      console.log("🔗 Test image URL:", testResponse.data[0].url);
    } catch (error) {
      console.log("❌ DALL-E 3 test failed:", error.message);
      console.log("🔍 Test error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        type: error.type,
        code: error.code,
      });

      console.log("🚨 CRITICAL: DALL-E 3 access test failed. This suggests:");
      console.log("   - API key doesn't have DALL-E 3 access");
      console.log("   - Account has billing issues");
      console.log("   - Account is suspended or restricted");
      console.log("   - Rate limits exceeded");
    }
  }

  async generateMarketingImages(businessProfile, content) {
    try {
      console.log(
        "🎨 Starting RAG-powered image generation for:",
        businessProfile.name,
        content.festival.name
      );

      // Generate optimized prompts using RAG agent
      let optimizedPrompts;
      try {
        optimizedPrompts = await this.ragAgent.generateAllPrompts(
          businessProfile,
          content
        );
        console.log("📝 Generated optimized prompts:", optimizedPrompts.length);
      } catch (error) {
        console.error(
          "❌ RAG prompt generation failed, using fallback prompts:",
          error
        );
        // Fallback to Typeface-style templates
        const templates = [
          "A modern minimalist store interior with clean lines",
          "A bright modern store interior with customers",
          "A clean modern product display area",
          "A modern retail workspace",
          "A modern store window display",
        ];
        optimizedPrompts = templates.map(
          (template) =>
            `${template} for a ${businessProfile.industry.toLowerCase()} business`
        );
      }

      const imageResults = [];
      const imageTypes = [
        "brand-celebration",
        "customer-engagement",
        "product-festival",
        "behind-scenes",
        "special-offer",
      ];

      // Generate RAG-powered marketing images with DALL-E 3
      for (let i = 0; i < optimizedPrompts.length; i++) {
        let imageUrl = null;
        let finalPrompt = optimizedPrompts[i];
        let generationAttempted = false;
        let generationSuccessful = false;

        console.log(
          `🎯 Generating RAG-powered marketing image for ${imageTypes[i]}`
        );
        console.log(`📝 Original RAG Prompt: ${finalPrompt}`);
        console.log(
          `🏢 Business: ${businessProfile.name} (${businessProfile.industry})`
        );
        console.log(`🎉 Festival: ${content.festival.name}`);

        // Sanitize prompt for DALL-E 3
        const sanitizedPrompt = this.sanitizePromptForDALLE3(
          finalPrompt,
          businessProfile,
          content
        );
        console.log(`🧹 Sanitized Prompt: ${sanitizedPrompt}`);

        // Attempt DALL-E 3 generation with sanitized prompt
        try {
          console.log(
            `🎯 Attempting DALL-E 3 generation for ${imageTypes[i]}: ${sanitizedPrompt}`
          );

          const imageResponse = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: sanitizedPrompt,
            size: "1024x1024",
            quality: "standard",
            style: "natural",
            n: 1,
          });

          imageUrl = imageResponse.data[0].url;
          console.log(
            `✅ RAG-powered DALL-E 3 generation successful: ${imageUrl}`
          );
          generationAttempted = true;
          generationSuccessful = true;
        } catch (error) {
          console.log(
            `❌ RAG-powered DALL-E 3 generation failed for ${imageTypes[i]}: ${error.message}`
          );
          console.log(`🔍 Full error details:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            type: error.type,
            code: error.code,
          });
          generationAttempted = true;
          generationSuccessful = false;

          // Fallback to RAG-optimized placeholder
          imageUrl = this.getRAGPlaceholderImage(
            imageTypes[i],
            businessProfile,
            content
          );
          console.log(
            `🔄 Using RAG-optimized placeholder for ${imageTypes[i]}: ${imageUrl}`
          );
        }

        imageResults.push({
          id: `img_${Date.now()}_${i}`,
          type: imageTypes[i],
          title: this.generateImageTitle(imageTypes[i], content.festival.name),
          description: this.generateImageDescription(
            imageTypes[i],
            businessProfile,
            content
          ),
          url: imageUrl,
          prompt: finalPrompt,
          error: generationSuccessful
            ? null
            : "RAG-powered DALL-E 3 generation failed",
          generatedAt: new Date().toISOString(),
          note: generationSuccessful
            ? "RAG-powered AI-generated image using DALL-E 3"
            : "RAG-optimized placeholder image (AI generation failed)",
          isAIGenerated: generationSuccessful,
          ragData: {
            festival: content.festival.name,
            business: businessProfile.name,
            industry: businessProfile.industry,
            prompt: finalPrompt,
          },
        });

        // Add delay between requests to avoid rate limiting
        if (i < optimizedPrompts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log(
        "🎉 RAG-powered image generation completed:",
        imageResults.length,
        "images"
      );
      return {
        success: true,
        images: imageResults,
        businessProfile,
        festival: content.festival,
        generatedAt: new Date().toISOString(),
        ragData: {
          festival: content.festival.name,
          business: businessProfile.name,
          industry: businessProfile.industry,
          prompts: optimizedPrompts,
        },
      };
    } catch (error) {
      console.error("❌ Error in image generation service:", error);
      return {
        success: false,
        error: error.message,
        images: [],
      };
    }
  }

  generateImageTitle(imageType, festivalName) {
    const titles = {
      "brand-celebration": `${festivalName} Brand Celebration`,
      "customer-engagement": `${festivalName} Customer Experience`,
      "product-festival": `${festivalName} Product Showcase`,
      "behind-scenes": `${festivalName} Behind the Scenes`,
      "special-offer": `${festivalName} Special Offer`,
    };
    return titles[imageType] || `${festivalName} Marketing Image`;
  }

  generateImageDescription(imageType, businessProfile, content) {
    const descriptions = {
      "brand-celebration": `Professional marketing image showcasing ${businessProfile.name} celebrating ${content.festival.name} with elegant branding and festive elements.`,
      "customer-engagement": `Authentic customer experience at ${businessProfile.name} during ${content.festival.name} celebrations, highlighting community and joy.`,
      "product-festival": `Creative product showcase from ${businessProfile.name} with ${content.festival.name} theme, perfect for social media marketing.`,
      "behind-scenes": `Behind-the-scenes look at ${businessProfile.name} team celebrating ${content.festival.name}, showing authentic workplace culture.`,
      "special-offer": `Marketing banner for ${businessProfile.name}'s ${content.festival.name} special offers, designed for maximum engagement.`,
    };
    return (
      descriptions[imageType] ||
      `Marketing image for ${businessProfile.name} celebrating ${content.festival.name}`
    );
  }

  getPlaceholderImage(imageType) {
    // Return modern, minimalist placeholder images
    const placeholders = {
      "brand-celebration":
        "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1024&h=1024&fit=crop&crop=center&auto=format", // Modern minimalist store interior
      "customer-engagement":
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1024&h=1024&fit=crop&crop=center&auto=format", // Modern store with customers
      "product-festival":
        "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1024&h=1024&fit=crop&crop=center&auto=format", // Clean product display
      "behind-scenes":
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1024&h=1024&fit=crop&crop=center&auto=format", // Modern workspace
      "special-offer":
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1024&h=1024&fit=crop&crop=center&auto=format", // Modern window display
    };
    const url = placeholders[imageType] || placeholders["brand-celebration"];
    console.log(`🎨 Generated modern placeholder for ${imageType}: ${url}`);
    return url;
  }

  getRAGPlaceholderImage(imageType, businessProfile, content) {
    // Modern, minimalist placeholder images based on business context
    const industry = businessProfile.industry.toLowerCase();

    const placeholders = {
      "brand-celebration": `https://source.unsplash.com/1024x1024/?modern,minimalist,store,interior,${industry}`,
      "customer-engagement": `https://source.unsplash.com/1024x1024/?modern,store,customers,${industry}`,
      "product-festival": `https://source.unsplash.com/1024x1024/?modern,product,display,${industry}`,
      "behind-scenes": `https://source.unsplash.com/1024x1024/?modern,workspace,${industry}`,
      "special-offer": `https://source.unsplash.com/1024x1024/?modern,store,window,display,${industry}`,
    };
    const url = placeholders[imageType] || placeholders["brand-celebration"];
    console.log(
      `🎨 Generated modern business placeholder for ${imageType}: ${url}`
    );
    return url;
  }

  sanitizePromptForDALLE3(originalPrompt, businessProfile, content) {
    // Typeface-inspired template-based approach
    const industry = businessProfile.industry.toLowerCase();
    const style = "modern minimalist"; // Default style

    // Brand-safe template layouts
    const templates = {
      "brand-celebration": {
        base: "A modern minimalist store interior with clean lines and simple decor",
        variants: [
          "front view with large window",
          "corner view with seating area",
          "entrance view with welcome area",
        ],
      },
      "customer-engagement": {
        base: "A bright modern store interior with people",
        variants: [
          "customers browsing products",
          "people at checkout counter",
          "customers being helped by staff",
        ],
      },
      "product-festival": {
        base: "A clean modern product display in a store",
        variants: [
          "items arranged on shelves",
          "window display setup",
          "counter display arrangement",
        ],
      },
      "behind-scenes": {
        base: "A modern retail workspace",
        variants: [
          "storage area organization",
          "staff preparation area",
          "inventory management space",
        ],
      },
      "special-offer": {
        base: "A modern store display window",
        variants: [
          "product showcase layout",
          "seasonal display setup",
          "promotional area design",
        ],
      },
    };

    // Determine image type from context
    let imageType = "brand-celebration";
    if (originalPrompt.toLowerCase().includes("customer"))
      imageType = "customer-engagement";
    else if (originalPrompt.toLowerCase().includes("product"))
      imageType = "product-festival";
    else if (originalPrompt.toLowerCase().includes("behind"))
      imageType = "behind-scenes";
    else if (originalPrompt.toLowerCase().includes("special"))
      imageType = "special-offer";

    // Select template and variant
    const template = templates[imageType];
    const variant =
      template.variants[Math.floor(Math.random() * template.variants.length)];

    // Combine template with industry context
    const prompt = `${template.base} for a ${industry} business, ${variant}, ${style} style`;

    return prompt;
  }

  async regenerateImage(businessProfile, content, imageType, originalPrompt) {
    try {
      console.log(`🔄 Regenerating image for type: ${imageType}`);

      // Use RAG agent to generate a new optimized prompt
      const newPrompt = await this.ragAgent.generateOptimizedPrompt(
        businessProfile,
        content,
        imageType
      );

      const imageResponse = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: newPrompt,
        size: "1024x1024",
        quality: "standard",
        style: "natural",
        n: 1,
      });

      const imageUrl = imageResponse.data[0].url;

      return {
        success: true,
        image: {
          id: `img_${Date.now()}_regenerated`,
          type: imageType,
          title: this.generateImageTitle(imageType, content.festival.name),
          description: this.generateImageDescription(
            imageType,
            businessProfile,
            content
          ),
          url: imageUrl,
          prompt: newPrompt,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("❌ Error regenerating image:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new ImageGenerationService();
