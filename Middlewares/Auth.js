const jwt = require("jsonwebtoken");

//middleware to check if token is present
// module.exports.verifyToken = (req, res, next) => {
//   console.log(token);
//   const token = req.header("x-auth-token");
//   if (!token) return res.status(401).send("Access denied. No token provided.");

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (ex) {
//     res.status(400).send("Invalid token.");
//   }
// };
module.exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);
  // Check if Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No or invalid Authorization header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract token after "Bearer "
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret
    req.user = decoded;
    console.log("Token verified:", decoded);
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
//middleware to check if user is admin
module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access denied. Admin privileges required.");
  }
};
