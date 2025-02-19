const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    agentId: { type: String, required: true },
    reviewText: { type: String, required: true },
    sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
    performance: { type: String, enum: ["fast", "average", "slow"] },
    accuracy: { type: String, enum: ["accurate", "mistake"] },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
