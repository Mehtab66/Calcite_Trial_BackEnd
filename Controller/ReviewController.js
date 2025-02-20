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
// Create a new review
module.exports.createReview = async (req, res) => {
  try {
    const { agentId, reviewText, location, rating } = req.body;
    const review = new Review({ agentId, reviewText, location, rating });
    const savedReview = await review.save();
    res
      .status(201)
      .json({ message: "Review created successfully", review: savedReview });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating review", error: error.message });
  }
};

// Fetch filtered reviews for dashboard
module.exports.getFilteredReviews = async (req, res) => {
  try {
    const { location, orderType, rating } = req.query;
    let query = {};

    if (location) query.location = location;
    if (orderType) query["tags.performance"] = orderType; // Assuming orderType maps to performance
    if (rating) query.rating = { $gte: parseInt(rating) };

    const reviews = await Review.find(query);
    res.json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

// Get review by ID
module.exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching review", error: error.message });
  }
};

// Update review by ID - Admin only
module.exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating review", error: error.message });
  }
};

// Delete review by ID - Admin only
module.exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
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

// module.exports.getAnalytics = async (req, res) => {
//   console.log("Entering getAnalytics"); // Log entry point
//   try {
//     console.log("Fetching reviews from DB");
//     const reviews = await Review.find().lean();
//     console.log("Reviews fetched:", reviews.length);

//     if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
//       console.log("No reviews found, returning defaults");
//       return res.status(200).json({
//         averageRatingsPerLocation: {},
//         topPerformingAgents: [],
//         bottomPerformingAgents: [],
//         mostCommonComplaints: [],
//         ordersByPriceRange: { "0-50": 0, "50-100": 0, "100+": 0 },
//       });
//     }

//     // Calculate average ratings per location
//     console.log("Calculating average ratings per location");
//     const averageRatingsPerLocation = reviews.reduce((acc, review) => {
//       if (
//         !review ||
//         typeof review.location !== "string" ||
//         typeof review.rating !== "number"
//       ) {
//         console.log("Skipping invalid review for location:", review);
//         return acc;
//       }
//       acc[review.location] = acc[review.location] || { total: 0, count: 0 };
//       acc[review.location].total += review.rating;
//       acc[review.location].count += 1;
//       return acc;
//     }, {});

//     for (const location in averageRatingsPerLocation) {
//       averageRatingsPerLocation[location] = Number(
//         (
//           averageRatingsPerLocation[location].total /
//           averageRatingsPerLocation[location].count
//         ).toFixed(2)
//       );
//     }

//     // Get top and bottom performing agents
//     console.log("Calculating agent performance");
//     const agentPerformance = reviews.reduce((acc, review) => {
//       if (!review || !review.agentId || typeof review.rating !== "number") {
//         console.log("Skipping invalid review for agent:", review);
//         return acc;
//       }
//       acc[review.agentId] = acc[review.agentId] || {
//         total: 0,
//         count: 0,
//         agentName: review.agentName || "Unknown",
//       };
//       acc[review.agentId].total += review.rating;
//       acc[review.agentId].count += 1;
//       return acc;
//     }, {});

//     const agents = Object.values(agentPerformance).map((agent) => ({
//       agentName: agent.agentName,
//       averageRating: Number((agent.total / agent.count).toFixed(2)),
//     }));

//     const sortedAgents = [...agents];
//     const topPerformingAgents = sortedAgents
//       .sort((a, b) => b.averageRating - a.averageRating)
//       .slice(0, 5);
//     const bottomPerformingAgents = sortedAgents
//       .sort((a, b) => a.averageRating - b.averageRating)
//       .slice(0, 5);

//     // Get most common complaints
//     console.log("Calculating most common complaints");
//     const complaints = reviews.flatMap((review) => {
//       if (!review || !Array.isArray(review.complaints)) {
//         console.log("Skipping invalid complaints:", review);
//         return [];
//       }
//       return review.complaints;
//     });
//     const complaintCounts = complaints.reduce((acc, complaint) => {
//       if (typeof complaint === "string") {
//         acc[complaint] = (acc[complaint] || 0) + 1;
//       }
//       return acc;
//     }, {});

//     const mostCommonComplaints = Object.entries(complaintCounts)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([complaint, count]) => ({ complaint, count }));

//     // Get orders by price range
//     console.log("Calculating orders by price range");
//     const ordersByPriceRange = reviews.reduce(
//       (acc, review) => {
//         if (!review || typeof review.orderPrice !== "number") {
//           console.log("Skipping invalid order price:", review);
//           return acc;
//         }
//         if (review.orderPrice <= 50) acc["0-50"] += 1;
//         else if (review.orderPrice <= 100) acc["50-100"] += 1;
//         else acc["100+"] += 1;
//         return acc;
//       },
//       { "0-50": 0, "50-100": 0, "100+": 0 }
//     );

//     console.log("Sending response");
//     res.status(200).json({
//       averageRatingsPerLocation,
//       topPerformingAgents,
//       bottomPerformingAgents,
//       mostCommonComplaints,
//       ordersByPriceRange,
//     });
//   } catch (error) {
//     console.error("Analytics Error:", error.stack); // Full stack trace
//     res
//       .status(500)
//       .json({ message: "Error fetching analytics", error: error.message });
//   }
// };

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
