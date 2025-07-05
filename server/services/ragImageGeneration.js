import OpenAI from "openai";
import FestivalDesignRAG from "./festivalRAG.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class RAGImageGenerationService {
  constructor() {
    this.openai = openai;
    this.ragAgent = new FestivalDesignRAG();
  }

  async generateMarketingImages(businessProfile, content) {
    try {
      console.log("🎨 Starting RAG-powered marketing image generation...");
      console.log("Business:", businessProfile.name, businessProfile.industry);
      console.log("Festival:", content.festival.name);

      // Get RAG-optimized prompts based on festival and business data
      const optimizedPrompts = await this.ragAgent.generateAllPrompts(
        businessProfile,
        content
      );

      console.log("📝 Generated RAG prompts:", optimizedPrompts);

      const imageTypes = [
        "brand-celebration",
        "customer-engagement",
        "product-festival",
        "behind-scenes",
        "special-offer",
      ];

      const imageResults = [];

      for (let i = 0; i < optimizedPrompts.length; i++) {
        let imageUrl = null;
        let finalPrompt = optimizedPrompts[i];
        let generationSuccessful = false;

        try {
          console.log(
            `🎯 Generating RAG-powered image for ${imageTypes[i]}: ${finalPrompt}`
          );

          const imageResponse = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: finalPrompt,
            size: "1024x1024",
            quality: "standard",
            style: "natural",
            n: 1,
          });

          imageUrl = imageResponse.data[0].url;
          console.log(
            `✅ RAG image generation successful for ${imageTypes[i]}: ${imageUrl}`
          );
          generationSuccessful = true;
        } catch (error) {
          console.log(
            `❌ RAG image generation failed for ${imageTypes[i]}: ${error.message}`
          );
          generationSuccessful = false;

          // Fallback to RAG-optimized placeholder
          imageUrl = this.getRAGPlaceholderImage(
            imageTypes[i],
            businessProfile,
            content
          );
          console.log(`🔄 Using RAG placeholder for ${imageTypes[i]}`);
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
          error: generationSuccessful ? null : "RAG generation failed",
          generatedAt: new Date().toISOString(),
          note: generationSuccessful
            ? "AI-generated using RAG data"
            : "RAG-optimized placeholder",
          isAIGenerated: generationSuccessful,
          ragData: {
            festival: content.festival.name,
            business: businessProfile.name,
            industry: businessProfile.industry,
            prompt: finalPrompt,
          },
        });

        // Add delay between requests
        if (i < optimizedPrompts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(
        "🎉 RAG image generation completed:",
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
      console.error("❌ Error in RAG image generation service:", error);
      return {
        success: false,
        error: error.message,
        images: [],
      };
    }
  }

  getRAGPlaceholderImage(imageType, businessProfile, content) {
    // RAG-optimized placeholder images based on festival and business
    const festivalName = content.festival.name.toLowerCase();
    const industry = businessProfile.industry.toLowerCase();

    const placeholders = {
      "brand-celebration": `https://source.unsplash.com/1024x1024/?restaurant,interior,celebration,${festivalName},${industry}`,
      "customer-engagement": `https://source.unsplash.com/1024x1024/?people,dining,restaurant,${festivalName},${industry}`,
      "product-festival": `https://source.unsplash.com/1024x1024/?food,presentation,restaurant,${festivalName},${industry}`,
      "behind-scenes": `https://source.unsplash.com/1024x1024/?restaurant,kitchen,${festivalName},${industry}`,
      "special-offer": `https://source.unsplash.com/1024x1024/?restaurant,marketing,${festivalName},${industry}`,
    };
    return placeholders[imageType] || placeholders["brand-celebration"];
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
      "brand-celebration": `RAG-generated marketing image showcasing ${businessProfile.name} celebrating ${content.festival.name} with culturally authentic branding and festive elements.`,
      "customer-engagement": `RAG-optimized customer experience at ${businessProfile.name} during ${content.festival.name} celebrations, highlighting community and cultural joy.`,
      "product-festival": `RAG-powered product showcase from ${businessProfile.name} with ${content.festival.name} theme, perfect for social media marketing.`,
      "behind-scenes": `RAG-generated behind-the-scenes look at ${businessProfile.name} team celebrating ${content.festival.name}, showing authentic workplace culture.`,
      "special-offer": `RAG-optimized marketing banner for ${businessProfile.name}'s ${content.festival.name} special offers, designed for maximum engagement.`,
    };
    return (
      descriptions[imageType] ||
      `RAG-generated marketing image for ${businessProfile.name} celebrating ${content.festival.name}`
    );
  }

  async regenerateImage(businessProfile, content, imageType, originalPrompt) {
    try {
      console.log(`🔄 Regenerating RAG image for type: ${imageType}`);

      // Generate new RAG-optimized prompt
      const newPrompt = await this.ragAgent.generateOptimizedPrompt(
        businessProfile,
        content,
        imageType
      );

      console.log(`🎯 Regenerating with RAG prompt: ${newPrompt}`);

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
          ragData: {
            festival: content.festival.name,
            business: businessProfile.name,
            industry: businessProfile.industry,
            prompt: newPrompt,
          },
        },
      };
    } catch (error) {
      console.error("❌ Error regenerating RAG image:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new RAGImageGenerationService();
