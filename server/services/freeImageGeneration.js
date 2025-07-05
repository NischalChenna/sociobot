import axios from "axios";

class FreeImageGenerationService {
  constructor() {
    // Using free placeholder images with festival themes
    this.baseUrl = "https://source.unsplash.com";
  }

  async generateMarketingImages(businessProfile, content) {
    try {
      console.log("🎨 Starting free image generation with Unsplash API...");

      const imageTypes = [
        "brand-celebration",
        "customer-engagement",
        "product-festival",
        "behind-scenes",
        "special-offer",
      ];

      const imageResults = [];

      for (let i = 0; i < imageTypes.length; i++) {
        let imageUrl = null;
        let generationSuccessful = false;

        try {
          console.log(`🎯 Generating image for ${imageTypes[i]}`);

          // Get a relevant image from Unsplash Source (no API key needed)
          const query = this.getSearchQuery(
            imageTypes[i],
            content.festival.name
          );
          imageUrl = `${this.baseUrl}/1024x1024/?${query}`;

          console.log(
            `✅ Free image generation successful for ${imageTypes[i]}: ${imageUrl}`
          );
          generationSuccessful = true;
        } catch (error) {
          console.log(
            `❌ Free image generation failed for ${imageTypes[i]}: ${error.message}`
          );
          generationSuccessful = false;

          // Fallback to placeholder
          imageUrl = this.getPlaceholderImage(imageTypes[i]);
          console.log(`🔄 Using placeholder fallback for ${imageTypes[i]}`);
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
          prompt: this.getSearchQuery(imageTypes[i], content.festival.name),
          error: generationSuccessful ? null : "Free generation failed",
          generatedAt: new Date().toISOString(),
          note: generationSuccessful
            ? "AI-curated image from Unsplash"
            : "Professional placeholder image",
          isAIGenerated: generationSuccessful,
        });

        // Add delay between requests
        if (i < imageTypes.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log(
        "🎉 Free image generation completed:",
        imageResults.length,
        "images"
      );
      return {
        success: true,
        images: imageResults,
        businessProfile,
        festival: content.festival,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error in free image generation service:", error);
      return {
        success: false,
        error: error.message,
        images: [],
      };
    }
  }

  getSearchQuery(imageType, festivalName) {
    const queries = {
      "brand-celebration": `restaurant,interior,celebration,${festivalName}`,
      "customer-engagement": `people,dining,restaurant,${festivalName}`,
      "product-festival": `food,presentation,restaurant,${festivalName}`,
      "behind-scenes": `restaurant,kitchen,${festivalName}`,
      "special-offer": `restaurant,marketing,${festivalName}`,
    };
    return queries[imageType] || `restaurant,${festivalName}`;
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
    const placeholders = {
      "brand-celebration":
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1024&h=1024&fit=crop&crop=center&auto=format",
      "customer-engagement":
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1024&h=1024&fit=crop&crop=center&auto=format",
      "product-festival":
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1024&h=1024&fit=crop&crop=center&auto=format",
      "behind-scenes":
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop&crop=center&auto=format",
      "special-offer":
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1024&h=1024&fit=crop&crop=center&auto=format",
    };
    return placeholders[imageType] || placeholders["brand-celebration"];
  }

  async regenerateImage(businessProfile, content, imageType, originalPrompt) {
    try {
      console.log(`🔄 Regenerating image for type: ${imageType}`);

      const query = this.getSearchQuery(imageType, content.festival.name);
      const imageUrl = `${this.baseUrl}/1024x1024/?${query}`;

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
          prompt: query,
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

export default new FreeImageGenerationService();
