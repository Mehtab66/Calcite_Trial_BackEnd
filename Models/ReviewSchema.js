// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  agentId: String,
  reviewText: String,
  location: String,
  tags: {
    sentiment: { type: String, enum: ["Positive", "Neutral", "Negative"] },
    performance: { type: String, enum: ["Fast", "Average", "Slow"] },
    accuracy: { type: String, enum: ["Accurate", "Mistake"] },
  },
  rating: Number,
});

module.exports = mongoose.model("Review", reviewSchema);
