const express = require("express");
let userRouter = express.Router();
let {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUser
} = require("../controller/userController");
let {
  loginUser,
  userSignUp,
  protectRoute,
  forgotPassword,
  resetPassword,
  logoutUser,
  updateMyPassword
} = require("../controller/authController");
// handler
// routers
userRouter
  .route("")
  .get(getAllUser);
// authentication routes
// resource
userRouter.route("/login").post(loginUser);
userRouter.route("/signup").post(userSignUp);
userRouter.route("/logout").get(logoutUser);

userRouter.route("/forgetPassword").post(forgotPassword);
userRouter.route("/resetPassword/:token").patch(resetPassword);
// req.header =>user
userRouter.route("/updateUser").patch(protectRoute, updateUser);
userRouter.route("/updateMyPassword").patch(protectRoute, updateMyPassword);

userRouter
  .route("/:id")
  .get(protectRoute, getUser)
  // req=>updateUser=>// admin
  .patch(protectRoute, updateUser)
  .delete(protectRoute, deleteUser);
module.exports = userRouter;
