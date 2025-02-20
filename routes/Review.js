var express = require("express");
var router = express.Router();
const ReviewController = require("../Controller/ReviewController");
const auth = require("../Middlewares/Auth");

router.get("/", auth.verifyToken, ReviewController.getAllReviews);
router.get("/analytics", auth.verifyToken, ReviewController.getAnalytics);

// Update a review - Admin only
router.put(
  "/:id/tag",
  auth.verifyToken,
  auth.isAdmin,
  ReviewController.updateReviewTags
);

// Auto-tag a review - Admin or possibly authenticated user if allowed
router.post(
  "/auto-tag",
  auth.verifyToken,
  auth.isAdmin,
  ReviewController.autoTagReview
);

module.exports = router;
