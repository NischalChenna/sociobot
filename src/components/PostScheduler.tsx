import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Globe,
  Twitter,
  Instagram,
  ArrowLeft,
  Send,
} from "lucide-react";
import { GeneratedContent, ScheduledPost } from "../types";

interface PostSchedulerProps {
  content: GeneratedContent;
  onScheduled: (post: ScheduledPost) => void;
  onBack: () => void;
}

export const PostScheduler: React.FC<PostSchedulerProps> = ({
  content,
  onScheduled,
  onBack,
}) => {
  const [selectedImagePrompt, setSelectedImagePrompt] = useState(
    content.imagePrompts[0]
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    ("twitter" | "instagram")[]
  >(["instagram"]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  // Update selected image prompt when content changes
  useEffect(() => {
    if (content.imagePrompts.length > 0) {
      setSelectedImagePrompt(content.imagePrompts[0]);
    }
  }, [content]);

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "UTC", label: "UTC" },
  ];

  const suggestedTimes = [
    { time: "09:00", label: "9:00 AM - Morning engagement" },
    { time: "12:00", label: "12:00 PM - Lunch break peak" },
    { time: "17:00", label: "5:00 PM - Evening commute" },
    { time: "19:00", label: "7:00 PM - Prime social time" },
  ];

  const handlePlatformToggle = (platform: "twitter" | "instagram") => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSchedule = () => {
    if (scheduledDate && scheduledTime && selectedPlatforms.length > 0) {
      const scheduledPost: ScheduledPost = {
        id: `post-${Date.now()}`,
        content,
        selectedImagePrompt,
        platforms: selectedPlatforms,
        scheduledDate: `${scheduledDate}T${scheduledTime}`,
        timezone,
        status: "pending",
      };
      onScheduled(scheduledPost);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Post</h1>
            <p className="text-gray-600">
              Configure your {content.festival.name} post
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Post Preview
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-800">{content.caption}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {content.hashtags.map((hashtag, index) => (
                    <span key={index} className="text-blue-600 text-sm">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Select Image Prompt:
                </h3>
                <div className="space-y-2">
                  {content.imagePrompts.map((prompt, index) => (
                    <label
                      key={index}
                      className={`block p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedImagePrompt === prompt
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="imagePrompt"
                        value={prompt}
                        checked={selectedImagePrompt === prompt}
                        onChange={() => setSelectedImagePrompt(prompt)}
                        className="sr-only"
                      />
                      <div className="text-xs font-semibold text-purple-600 mb-1">
                        Prompt {index + 1}:
                      </div>
                      <div className="text-sm text-gray-700">{prompt}</div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Scheduling Options
            </h2>

            {/* Platform Selection */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Select Platforms:
              </h3>
              <div className="space-y-2">
                <label
                  className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedPlatforms.includes("instagram")
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes("instagram")}
                    onChange={() => handlePlatformToggle("instagram")}
                    className="sr-only"
                  />
                  <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                  <span className="font-medium">Instagram</span>
                </label>

                <label
                  className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedPlatforms.includes("twitter")
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes("twitter")}
                    onChange={() => handlePlatformToggle("twitter")}
                    className="sr-only"
                  />
                  <Twitter className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Twitter</span>
                </label>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 mb-2"
              />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Suggested optimal times:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedTimes.map((suggestion) => (
                    <button
                      key={suggestion.time}
                      onClick={() => setScheduledTime(suggestion.time)}
                      className="text-left p-2 text-xs bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timezone Selection */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Globe className="w-4 h-4 mr-2" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              disabled={
                !scheduledDate ||
                !scheduledTime ||
                selectedPlatforms.length === 0
              }
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Schedule Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
