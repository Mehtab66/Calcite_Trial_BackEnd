var express = require("express");
var router = express.Router();
const UserController = require("../Controller/UserController");
const auth = require("../Middlewares/Auth");

//registeration route
router.post("/register", UserController.register);

//login route
router.post("/login", UserController.login);

//elevate user to admin route
router.put(
  "/elevate/:userId",
  auth.verifyToken,
  auth.isAdmin,
  UserController.elevateToAdmin
);

//get users
router.get("/", auth.verifyToken, auth.isAdmin, UserController.getUsers);
//delete users
router.delete("/:id", UserController.DeleteUser);
//update users
router.put("/:id/role", UserController.UpdateRole);
module.exports = router;
