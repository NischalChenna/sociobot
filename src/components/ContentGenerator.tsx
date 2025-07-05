import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Hash,
  Image,
  ChevronRight,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import { BusinessProfile, GeneratedContent } from "../types";

import { contentAPI } from "../utils/api";

interface ContentGeneratorProps {
  profile: BusinessProfile;
  onContentGenerated: (content: GeneratedContent) => void;
  onBack: () => void;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  profile,
  onContentGenerated,
  onBack,
}) => {
  const [generatedContents, setGeneratedContents] = useState<
    GeneratedContent[]
  >([]);
  const [selectedContent, setSelectedContent] =
    useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState<number | null>(
    null
  );
  const [marketingImages, setMarketingImages] = useState<string[]>([]);

  useEffect(() => {
    // Simulate content generation
    setLoading(true);
    setTimeout(() => {
      // const contents = relevantFestivals.map((festival) =>
      //   generateContent(profile, festival)
      // );
      const sampleContent: GeneratedContent = {
        caption:
          "Celebrate the vibrant spirit of Diwali with lights, joy, and togetherness!",
        hashtags: [
          "#Diwali2025",
          "#FestivalOfLights",
          "#CelebrateTogether",
          "#IndianFestivals",
        ],
        imagePrompts: [
          "a festive Indian home decorated with diyas and rangoli at night",
          "people celebrating Diwali with fireworks and traditional clothing",
        ],
        festival: {
          id: "fest-001",
          name: "Diwali",
          date: "2025-10-29",
          type: "Cultural",
          description:
            "Diwali, the festival of lights, is celebrated with great enthusiasm across India with diyas, sweets, and fireworks.",
          relevantTo: ["Hindus", "Indians", "South Asians"],
        },
      };

      setGeneratedContents([sampleContent]);
      setLoading(false);
    }, 1500);
  }, [profile]);

  const handleSelectContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    generateMarketingImagesForContent(content);
  };

  const generateMarketingImagesForContent = async (
    content: GeneratedContent
  ) => {
    setGeneratingImages(true);
    try {
      console.log("🎨 Starting RAG-powered marketing image generation...");
      console.log("Business Profile:", profile);
      console.log("Selected Festival:", content.festival);

      // Use the RAG-powered image generation service
      const result = await contentAPI.generateMarketingImages(profile, content);
      console.log("🔍 Raw API response:", result);

      if (result && result.images && Array.isArray(result.images)) {
        const imageData = result.images.map(
          (img: { url: string; isAIGenerated?: boolean }) => ({
            url: img.url,
            isAIGenerated: img.isAIGenerated || false,
          })
        );
        setMarketingImages(
          imageData.map(
            (img: { url: string; isAIGenerated?: boolean }) => img.url
          )
        );
        console.log(
          "✅ Generated RAG-powered marketing images:",
          imageData.map((img: { url: string; isAIGenerated?: boolean }) => ({
            url: img.url,
            isAIGenerated: img.isAIGenerated,
          }))
        );
      } else if (result && Array.isArray(result)) {
        // Fallback for direct array response
        setMarketingImages(result);
        console.log("✅ Generated RAG-powered images (direct array):", result);
      } else {
        console.error("Invalid response format:", result);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to generate RAG-powered marketing images:", error);
      // Fallback to placeholder images
      setMarketingImages([
        "/api/placeholder/1",
        "/api/placeholder/2",
        "/api/placeholder/3",
        "/api/placeholder/4",
        "/api/placeholder/5",
      ]);
    } finally {
      setGeneratingImages(false);
    }
  };

  const regenerateImage = async (
    imageType: string,
    imageIndex: number,
    originalPrompt?: string
  ) => {
    if (!selectedContent) return;

    setRegeneratingImage(imageIndex);

    try {
      console.log(`🔄 Regenerating ${imageType} image...`);

      const result = await contentAPI.regenerateMarketingImage(
        profile,
        selectedContent,
        imageType,
        originalPrompt
      );

      if (result.success && result.image) {
        // Update the specific image in the array
        setMarketingImages((prev) =>
          prev.map((img, index) => {
            const imageTypes = [
              "brand-celebration",
              "customer-engagement",
              "product-festival",
              "behind-scenes",
              "special-offer",
            ];
            const typeIndex = imageTypes.indexOf(imageType);
            return index === typeIndex ? result.image.url : img;
          })
        );
        console.log("✅ Regenerated image successfully");
      } else {
        console.error("❌ Regeneration failed:", result.error);
      }
    } catch (error) {
      console.error("Failed to regenerate image:", error);
    } finally {
      setRegeneratingImage(null);
    }
  };

  const handleRegenerateImages = () => {
    if (selectedContent) {
      generateMarketingImagesForContent(selectedContent);
    }
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${profile.name}-${
      selectedContent?.festival.name
    }-marketing-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generating Content
          </h2>
          <p className="text-gray-600">
            Creating personalized festival posts for {profile.name}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Generated Content
            </h1>
            <p className="text-gray-600">
              Choose from AI-generated festival posts for {profile.name}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {generatedContents.map((content) => (
            <div
              key={content.festival.id}
              className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all duration-200 cursor-pointer hover:shadow-2xl ${
                selectedContent?.festival.id === content.festival.id
                  ? "border-purple-500 ring-2 ring-purple-200"
                  : "border-transparent hover:border-purple-200"
              }`}
              onClick={() => handleSelectContent(content)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {content.festival.name}
                    </h3>
                    <p className="text-gray-600">
                      {new Date(content.festival.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-6 h-6 transition-colors ${
                    selectedContent?.festival.id === content.festival.id
                      ? "text-purple-600"
                      : "text-gray-400"
                  }`}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generated Caption
                  </h4>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-xl">
                    {content.caption}
                  </p>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4 mr-2" />
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {content.hashtags.map((hashtag, hashIndex) => (
                      <span
                        key={hashIndex}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Marketing Images Section */}
                {selectedContent?.festival.id === content.festival.id && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="flex items-center text-sm font-semibold text-gray-700">
                        <Image className="w-4 h-4 mr-2" />
                        Marketing Images
                      </h4>
                      <button
                        onClick={handleRegenerateImages}
                        disabled={generatingImages}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-4 h-4 mr-1 ${
                            generatingImages ? "animate-spin" : ""
                          }`}
                        />
                        Regenerate
                      </button>
                    </div>

                    {generatingImages ? (
                      <div className="grid grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square bg-gray-200 rounded-xl animate-pulse flex items-center justify-center"
                          >
                            <div className="text-gray-400">Generating...</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-4">
                        {marketingImages.map((imageUrl, imageIndex) => {
                          console.log(
                            `🖼️ Rendering image ${imageIndex + 1}:`,
                            imageUrl
                          );
                          return (
                            <div key={imageIndex} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Marketing image ${imageIndex + 1}`}
                                className="w-full aspect-square object-cover rounded-xl shadow-lg"
                                onLoad={() =>
                                  console.log(
                                    `✅ Image ${
                                      imageIndex + 1
                                    } loaded successfully`
                                  )
                                }
                                onError={(e) =>
                                  console.error(
                                    `❌ Image ${
                                      imageIndex + 1
                                    } failed to load:`,
                                    e
                                  )
                                }
                              />
                              {/* AI Generation Indicator */}
                              <div className="absolute top-2 left-2">
                                <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  AI Generated
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-xl flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadImage(imageUrl, imageIndex);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:bg-gray-100"
                                  title="Download Image"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const imageTypes = [
                                      "brand-celebration",
                                      "customer-engagement",
                                      "product-festival",
                                      "behind-scenes",
                                      "special-offer",
                                    ];
                                    regenerateImage(
                                      imageTypes[imageIndex],
                                      imageIndex
                                    );
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-purple-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:bg-purple-700"
                                  title="Regenerate Image"
                                  disabled={regeneratingImage === imageIndex}
                                >
                                  <RefreshCw
                                    className={`w-4 h-4 ${
                                      regeneratingImage === imageIndex
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Image className="w-4 h-4 mr-2" />
                    AI Image Prompts
                  </h4>
                  <div className="space-y-2">
                    {content.imagePrompts.map((prompt, promptIndex) => (
                      <div
                        key={promptIndex}
                        className="bg-purple-50 border border-purple-200 p-3 rounded-xl"
                      >
                        <span className="text-xs font-semibold text-purple-600 mb-1 block">
                          Prompt {promptIndex + 1}:
                        </span>
                        <p className="text-sm text-gray-700">{prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedContent && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onContentGenerated(selectedContent)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 inline-flex items-center"
            >
              Proceed to Scheduling
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
