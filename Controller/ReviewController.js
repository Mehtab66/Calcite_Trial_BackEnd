const Review = require("../Models/ReviewSchema");
const Sentiment = require("sentiment");

//get all reviews
module.exports.getAllReviews = async (req, res) => {
  console.log("Entering getAllReviews");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .select(
        "agentName orderType manualTags discountApplied location rating performance accuracy sentiment complaints orderPrice"
      )
      .skip(skip)
      .limit(limit)
      .lean();

    const totalReviews = await Review.countDocuments();

    console.log(
      `Reviews fetched: ${reviews.length} (Page ${page}, Limit ${limit})`
    );
    res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.stack);
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

// Auto-tag a review (basic implementation)
module.exports.autoTagReview = async (req, res) => {
  const sentiment = new Sentiment();
  try {
    const { reviewText } = req.body;
    const result = sentiment.analyze(reviewText);
    const tags = {
      sentiment:
        result.score > 0
          ? "Positive"
          : result.score < 0
          ? "Negative"
          : "Neutral",
      performance: reviewText.toLowerCase().includes("fast")
        ? "Fast"
        : "Average", // Simplified, should be more robust
      accuracy: reviewText.toLowerCase().includes("mistake")
        ? "Mistake"
        : "Accurate",
    };

    const updatedReview = await Review.findByIdAndUpdate(
      req.body._id,
      { tags },
      { new: true, runValidators: true }
    );
    if (!updatedReview)
      return res.status(404).json({ message: "Review not found for tagging" });
    res.json({ message: "Review tagged successfully", review: updatedReview });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error tagging review", error: error.message });
  }
};

module.exports.getAnalytics = async (req, res) => {
  console.log("Entering getAnalytics");
  try {
    const reviewsAggregation = await Review.aggregate([
      // Stage 1: Group by location for average ratings
      {
        $group: {
          _id: "$location",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      // Stage 2: Format the result
      {
        $project: {
          _id: 0,
          location: "$_id",
          avgRating: { $round: ["$avgRating", 2] },
        },
      },
    ]);

    if (!reviewsAggregation.length) {
      console.log("No reviews found, returning defaults");
      return res.status(200).json({
        averageRatingsPerLocation: {},
        topPerformingAgents: [],
        bottomPerformingAgents: [],
        mostCommonComplaints: [],
        ordersByPriceRange: { "0-50": 0, "50-100": 0, "100+": 0 },
      });
    }

    // Convert aggregation result to object
    const averageRatingsPerLocation = reviewsAggregation.reduce(
      (acc, { location, avgRating }) => {
        acc[location] = avgRating;
        return acc;
      },
      {}
    );

    // Agent performance
    const agentAggregation = await Review.aggregate([
      {
        $group: {
          _id: "$agentId",
          avgRating: { $avg: "$rating" },
          agentName: { $first: "$agentName" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          agentId: "$_id",
          agentName: 1,
          averageRating: { $round: ["$avgRating", 2] },
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    const topPerformingAgents = agentAggregation.slice(0, 5);
    const bottomPerformingAgents = agentAggregation.slice(-5).reverse();

    // Most common complaints
    const complaintsAggregation = await Review.aggregate([
      { $unwind: "$complaints" },
      {
        $group: {
          _id: "$complaints",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          complaint: "$_id",
          count: 1,
        },
      },
    ]);

    const mostCommonComplaints = complaintsAggregation;

    // Orders by price range
    const priceAggregation = await Review.aggregate([
      {
        $bucket: {
          groupBy: "$orderPrice",
          boundaries: [0, 50, 100, Infinity],
          default: "100+",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const ordersByPriceRange = {
      "0-50": priceAggregation.find((b) => b._id === 0)?.count || 0,
      "50-100": priceAggregation.find((b) => b._id === 50)?.count || 0,
      "100+": priceAggregation.find((b) => b._id === "100+")?.count || 0,
    };

    console.log("Sending response");
    res.status(200).json({
      averageRatingsPerLocation,
      topPerformingAgents,
      bottomPerformingAgents,
      mostCommonComplaints,
      ordersByPriceRange,
    });
  } catch (error) {
    console.error("Analytics Error:", error.stack);
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};

module.exports.updateReviewTags = async (req, res) => {
  const { performance, accuracy, sentiment } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  review.performance = performance || review.performance;
  review.accuracy = accuracy || review.accuracy;
  review.sentiment = sentiment || review.sentiment;
  await review.save();
  res.json({ message: "Review tags updated", review });
};
