const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchema");

//User Registeration module
module.exports.register = async (req, res) => {
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

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.status(201).send({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//User Login module
module.exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password.");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.send({ token });
  } catch (error) {
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
