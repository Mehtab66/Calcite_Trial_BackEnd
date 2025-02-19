var express = require("express");
var router = express.Router();
const ReviewController = require("../Controllers/ReviewController");
const auth = require("../Middlewares/Auth");

//Add a review
router.post(
  "/AddReview",
  auth.verifyToken,
  auth.isAuthenticated,
  ReviewController.createReview
);

// Fetch all reviews or filtered reviews
router.get("/getFilteredReviews", ReviewController.getFilteredReviews);

// Fetch a specific review by ID
router.get("/:id", ReviewController.getReviewById);

// Update a review - Admin only
router.put(
  "/:id",
  auth.verifyToken,
  auth.isAdmin,
  ReviewController.updateReview
);

// Delete a review - Admin only
router.delete(
  "/:id",
  auth.verifyToken,
  auth.isAdmin,
  ReviewController.deleteReview
);

// Auto-tag a review - Admin or possibly authenticated user if allowed
router.post(
  "/auto-tag",
  auth.verifyToken,
  auth.isAuthenticated,
  ReviewController.autoTagReview
);
module.exports = router;
