var express = require("express");
var router = express.Router();
const UserController = require("../Controllers/UserController");
const auth = require("../Middlewares/Auth");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.put(
  "/elevate/:userId",
  auth.verifyToken,
  auth.isAdmin,
  UserController.elevateToAdmin
);

module.exports = router;
