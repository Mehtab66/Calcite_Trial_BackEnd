const Review = require("../Models/ReviewSchema");
const Sentiment = require("sentiment");

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
