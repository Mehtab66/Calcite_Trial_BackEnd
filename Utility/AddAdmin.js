const User = require("../Models/UserSchema");
const connectDB = require("../Config/db.config");
const bcrypt = require("bcryptjs");

console.log("🔄 Running AddAdmin.js...");

const createAdminManually = async () => {
  try {
    await connectDB(); // Ensure MongoDB is connected

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ email: "calcite@gmail.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists. Skipping creation.");
      process.exit(0);
    }

    // If no admin exists, create one
    const admin = new User({
      name: "Admin",
      email: "calcite@gmail.com",
      password: "calcite1122",
      role: "admin",
    });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();

    console.log("✅ Admin Created Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error Creating Admin:", error);
    process.exit(1);
  }
};

createAdminManually();
