require("dotenv").config();
const { faker } = require("@faker-js/faker");
const Reviews = require("../Models/ReviewSchema");
const mongoose = require("mongoose");
const connect = require("../Config/db.config");
console.log("✅ Running FakeData.js");
console.log(process.env.MONGO_URL);

// Predefined sensible review templates
//50 positive reviews out of which random will be selected if this is the category
const positiveReviews = [
  "Absolutely amazing service! The delivery was quick and the agent was very polite.",
  "Fast and efficient! My package arrived even before the estimated time.",
  "The agent was very professional and the order was 100% correct. Highly recommended!",
  "Great service! The delivery guy was courteous and my order was perfect.",
  "Very impressed with the speed and accuracy. Definitely using this service again!",
  "Flawless delivery experience. The package arrived in perfect condition.",
  "My delivery was super fast! Thanks for the great service.",
  "Everything was smooth from order placement to delivery. Five stars!",
  "The driver was friendly, and my package arrived exactly as expected.",
  "Punctual and professional service. Will order again.",
  "Quick response and excellent tracking updates. No complaints!",
  "I was surprised by the fast delivery! Highly recommend.",
  "The package arrived early, and everything was intact.",
  "Great packaging and timely delivery. Couldn't ask for more.",
  "Highly reliable service. My orders are always on time.",
  "Fast shipping and great customer service. Will use again!",
  "Really happy with the delivery speed and accuracy.",
  "Everything arrived exactly as described. Great experience.",
  "Best delivery experience I’ve had so far. Keep up the good work!",
  "Superb job! Delivery was ahead of schedule and well handled.",
  "The delivery agent was very respectful and careful with my package.",
  "Very happy with the service! No delays, no damage.",
  "Reliable and efficient! Great job by the team.",
  "Extremely professional service. Impressed with the delivery agent.",
  "Smooth process from start to finish. Highly recommended!",
  "Received my order ahead of time. Very satisfied.",
  "Delivery was seamless and stress-free.",
  "Excellent communication and fast delivery. Thank you!",
  "Everything was perfect, from packaging to timing.",
  "The best delivery service I've used so far.",
  "Really pleased with how smoothly everything went.",
  "Got my order within hours! Amazing speed.",
  "This service never disappoints. 100% satisfied.",
  "Very organized delivery team. Impressive work!",
  "Couldn't be happier with the efficiency of the service.",
  "Wonderful experience! The agent was friendly and professional.",
  "Delivered earlier than expected, which was a great surprise.",
  "Secure and fast delivery, excellent as always.",
  "I trust this service for all my deliveries.",
  "Fantastic delivery experience! Keep up the good work.",
  "Fast delivery and polite staff. Great combo!",
  "Would definitely recommend this service to friends and family.",
  "The delivery process was smooth and hassle-free.",
  "No issues at all. Delivery was on point!",
  "Always impressed by their consistency and speed.",
  "The package was well-handled and arrived on time.",
  "Top-notch service. Can’t complain about anything!",
  "Got exactly what I ordered, and the process was easy.",
  "Everything was spot on! Happy with my delivery.",
  "The delivery agent even called to confirm my availability. Great service!",
];

//neutral reviews out of which random will be selected if this is the category
const neutralReviews = [
  "The delivery was okay. It took a bit longer than expected, but the order was correct.",
  "Not bad, but there’s room for improvement. The package arrived a little late.",
  "The service was average. Nothing outstanding, but nothing terrible either.",
  "Delivery time was fine, but the packaging could have been better.",
  "It was an okay experience. I received my order but expected better communication.",
  "The delivery was neither fast nor slow. Just an average experience.",
  "Order was correct, but the packaging was slightly damaged.",
  "Decent service, but I’ve seen better from other companies.",
  "The delivery guy seemed rushed, but at least the order was right.",
  "Nothing too special. Just another delivery service.",
  "The tracking information was unclear, but the package arrived eventually.",
  "Had to wait a bit longer than expected, but at least the order was right.",
  "Good effort, but the process could be smoother.",
  "Communication from the company was lacking, but the order arrived.",
  "A mixed experience. Some aspects were great, others not so much.",
  "I had to contact customer service for an update, but it got resolved.",
  "I wish the delivery was faster, but it wasn’t too bad.",
  "Average timing. Not too fast, not too slow.",
  "Delivery was later than estimated but arrived in good shape.",
  "The packaging could use some improvement.",
  "A standard delivery. Nothing to complain about, nothing to praise.",
  "It was just another delivery experience, nothing impressive.",
  "I wish the tracking system was better.",
  "The driver wasn’t very engaging, but at least the package was delivered.",
  "Had to follow up once, but the issue was resolved.",
  "Expected a little more professionalism from the staff.",
  "Decent service, but there’s potential for improvement.",
  "The package was left outside without notification.",
  "Delivery was acceptable, but I wouldn’t rave about it.",
  "Came a little late, but no major issues.",
  "Overall, it was fine. Nothing more, nothing less.",
  "I received my order, but I wasn’t impressed.",
  "Could have been faster, but at least it was accurate.",
  "It worked out in the end, but it was not seamless.",
  "Tracking updates were inconsistent, but the package was okay.",
  "It was okay, but I might try a different service next time.",
  "I expected more based on other reviews.",
  "Had to wait a bit, but no major issues.",
  "The order arrived, but it wasn’t packaged well.",
  "It was neither good nor bad.",
  "At least I got what I ordered, even if it took longer than expected.",
  "Everything was fine, but I wouldn’t say it was great.",
  "Slightly slow delivery, but the product was intact.",
  "Could improve the delivery tracking system.",
  "Not the best, not the worst. Just an average delivery.",
  "It was on time, but not particularly outstanding.",
  "Nothing too exciting, but it did the job.",
];

//negative reviews out of which random will be selected if this is the category
const negativeReviews = [
  "Terrible experience! The delivery was late and the order was wrong.",
  "Very disappointed. My package was damaged when it arrived.",
  "The agent was rude and unhelpful. Will not use this service again.",
  "Delivery was extremely slow, and they didn’t provide updates.",
  "My order was completely incorrect, and customer support was no help at all.",
  "Horrible experience. The worst delivery service I’ve ever used.",
  "The package was delivered to the wrong address!",
  "I had to wait an extra week for my order.",
  "The delivery guy didn’t even bother ringing the doorbell.",
  "They lost my package and refused to refund me.",
  "I received the wrong item and had to go through a long return process.",
  "Customer service was unresponsive and unhelpful.",
  "Delayed delivery with zero communication.",
  "I paid for express delivery, but it still arrived late.",
  "The tracking system was broken, and I had no idea where my package was.",
  "They promised a delivery date and missed it by days.",
  "The product was crushed inside the package.",
  "Really bad experience. Never using this again.",
  "My package was stolen because they left it outside in plain sight.",
  "Delivery agent was unprofessional and rude.",
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
      agentId: faker.string.alphanumeric(8), // Random agent ID
      reviewText,
      location: faker.location.city(), // Random city name
      tags: {
        sentiment: getSentiment(rating),
        performance: faker.helpers.arrayElement(["Fast", "Average", "Slow"]),
        accuracy: faker.helpers.arrayElement(["Accurate", "Mistake"]),
      },
      rating,
    });
  }

  return data;
};

//function for storing the generated
const insertReviews = async () => {
  connect();
  try {
    const reviews = generateReviews(500);
    await Reviews.insertMany(reviews);
    console.log("Reviews inserted successfully!");
  } catch (err) {
    console.log(err);
  }
};

//calling the funciton
insertReviews();
