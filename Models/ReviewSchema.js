const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Review Identification
  reviewId: {
    type: String,
    required: true,
    unique: true,
  },

  // Delivery Agent Details
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },

  // Customer Details
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },

  // Order Details
  orderId: {
    type: String,
    required: true,
  },
  orderPrice: {
    type: Number,
    required: true,
  },
  discountApplied: {
    type: Number,
    default: 0,
  },
  orderType: {
    type: String,
    enum: ["Standard", "Express", "Same-Day"],
    required: true,
  },

  // Automated Tags
  sentiment: {
    type: String,
    enum: ["Positive", "Neutral", "Negative"],
    default: "Neutral",
  },
  performance: {
    type: String,
    enum: ["Fast", "Average", "Slow"],
    default: "Average",
  },
  accuracy: {
    type: String,
    enum: ["Order Accurate", "Order Mistake"],
    default: "Order Accurate",
  },

  // Manual Tags (for Admin edits)
  manualTags: [
    {
      type: String,
    },
  ],

  // Complaints
  complaints: [
    {
      type: String,
      enum: [
        "Late Delivery",
        "Wrong Item",
        "Cold Food",
        "Damaged Goods",
        "Other",
      ],
    },
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster querying
reviewSchema.index({
  agentId: 1,
  location: 1,
  sentiment: 1,
  performance: 1,
  accuracy: 1,
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
