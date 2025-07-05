import mongoose from "mongoose";

const festivalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: Date,
    type: {
      type: String,
      required: true,
    },
    description: String,
    regions: [String],
    countries: [String],
    relevantIndustries: [
      {
        type: String,
        enum: ["food", "retail", "hospitality", "fitness", "general"],
      },
    ],
    tags: [String],
    importance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    customPrompts: {
      food: String,
      retail: String,
      hospitality: String,
      fitness: String,
      general: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create separate indexes instead of compound index with parallel arrays
festivalSchema.index({ date: 1 });
festivalSchema.index({ relevantIndustries: 1 });
festivalSchema.index({ regions: 1 });

export default mongoose.model("Festival", festivalSchema);
