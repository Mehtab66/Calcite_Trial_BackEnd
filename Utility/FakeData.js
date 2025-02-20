require("dotenv").config();
const { faker } = require("@faker-js/faker");
const Reviews = require("../Models/ReviewSchema");
const mongoose = require("mongoose");
const connect = require("../Config/db.config");
console.log("✅ Running FakeData.js");
console.log(process.env.MONGO_URL);

// Predefined sensible review comments
const positiveReviews = [
  "Absolutely amazing service! The delivery was quick and the agent was very polite.",
  "Fast and efficient! My package arrived even before the estimated time.",
  "Great service! The delivery guy was courteous and my order was perfect.",
  "Very impressed with the speed and accuracy. Definitely using this service again!",
  "Flawless delivery experience. The package arrived in perfect condition.",
  "The agent was very professional and ensured everything was accurate.",
  "Superb experience! No complaints at all.",
  "Highly recommended! The best service I've used so far.",
  "The agent even helped me carry my package inside. Great service!",
  "Smooth and hassle-free delivery. Thank you!",
];

const neutralReviews = [
  "The delivery was okay. It took a bit longer than expected, but the order was correct.",
  "Not bad, but there’s room for improvement.",
  "The service was average. Nothing outstanding, but nothing terrible either.",
  "Delivery time was fine, but the packaging could have been better.",
  "It was an okay experience. I received my order but expected better communication.",
  "The tracking was inconsistent, but the package eventually arrived.",
  "I had to wait a bit longer than expected, but at least my order was correct.",
  "The delivery guy seemed rushed, but at least the order was right.",
  "Overall, it was just another delivery. Nothing special.",
  "Delivery was fine, but I wouldn't call it exceptional.",
];

const negativeReviews = [
  "Terrible experience! The delivery was late and the order was wrong.",
  "Very disappointed. My package was damaged when it arrived.",
  "The agent was rude and unhelpful. Will not use this service again.",
  "Delivery was extremely slow, and they didn’t provide updates.",
  "My order was completely incorrect, and customer support was no help at all.",
  "They lost my package and refused to refund me.",
  "Customer service was unresponsive and unhelpful.",
  "Delayed delivery with zero communication.",
  "The tracking system was broken, and I had no idea where my package was.",
  "The product was crushed inside the package.",
];

// Rating-based sentiment mapping
const getSentiment = (rating) => {
  if (rating >= 4) return "Positive";
  if (rating === 3) return "Neutral";
  return "Negative";
};

const generateReviews = (count) => {
  let data = [];

  for (let i = 0; i < count; i++) {
    let rating = faker.number.int({ min: 1, max: 5 });

    let reviewText;
    if (rating >= 4) {
      reviewText = faker.helpers.arrayElement(positiveReviews);
    } else if (rating === 3) {
      reviewText = faker.helpers.arrayElement(neutralReviews);
    } else {
      reviewText = faker.helpers.arrayElement(negativeReviews);
    }

    data.push({
      reviewId: faker.string.uuid(),
      agentId: new mongoose.Types.ObjectId(),
      agentName: faker.person.fullName(),
      location: faker.location.city(),
      customerId: faker.string.uuid(),
      customerName: faker.person.fullName(),
      rating,
      comment: reviewText,
      orderId: faker.string.uuid(),
      orderPrice: faker.number.float({ min: 10, max: 500, precision: 2 }),
      discountApplied: faker.number.float({ min: 0, max: 50, precision: 2 }),
      orderType: faker.helpers.arrayElement([
        "Standard",
        "Express",
        "Same-Day",
      ]),
      sentiment: getSentiment(rating),
      performance: faker.helpers.arrayElement(["Fast", "Average", "Slow"]),
      accuracy: faker.helpers.arrayElement(["Order Accurate", "Order Mistake"]),
      manualTags: faker.helpers.arrayElements(
        ["Urgent", "High Priority", "VIP Customer"],
        faker.number.int({ min: 0, max: 2 })
      ),
      complaints: faker.helpers.arrayElements(
        ["Late Delivery", "Wrong Item", "Cold Food", "Damaged Goods", "Other"],
        faker.number.int({ min: 0, max: 2 })
      ),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  return data;
};

const insertReviews = async () => {
  connect();
  try {
    const reviews = generateReviews(500);
    await Reviews.insertMany(reviews);
    console.log("Reviews inserted successfully!");
  } catch (err) {
    console.log(err);
    console.log(err);
  }
};

insertReviews();
