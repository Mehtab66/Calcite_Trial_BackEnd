const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchema");

//User Registeration module
module.exports.register = async (req, res) => {
  console.log("into the register");
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || "user",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//User Login module
module.exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    if (user.isDeleted)
      return res.status(400).json({ message: "User not found" });
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.status(200).json({ token, user });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

//Promote user to admin module
module.exports.elevateToAdmin = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).send("Access denied. Admin role required.");

  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send("User not found");

  if (user.role !== "admin") {
    user.role = "admin";
    await user.save();
    res.send({ message: "User role elevated to admin successfully" });
  } else {
    res.status(400).send("User is already an admin");
  }
};

//get all users
module.exports.getUsers = async (req, res) => {
  console.log(req.user);
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isDeleted: false,
    }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//deleteUser
module.exports.DeleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isDeleted = true;
  await user.save();
  res.json({ message: "User deleted" });
};

//
module.exports.UpdateRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = role;
  await user.save();
  res.json({
    message: "User role updated",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};
