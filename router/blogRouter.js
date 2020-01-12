const express = require("express");
let blogRouter = express.Router();

let { getAllBlogs, createBlog,getBlog,updateBlog,deleteBlog } = require("../controller/blogController");
let {
  protectRoute,
  authorize
} = require("../controller/authController");
blogRouter
  .route("")
  .get(getAllBlogs)
  .post(protectRoute, authorize("admin", "writer"),createBlog);
  blogRouter
  .route("/:id")
  .get(getBlog)
  .patch(protectRoute, authorize("admin", "writer"),updateBlog)
  .delete(protectRoute, authorize("admin", "writer"),deleteBlog);
module.exports=blogRouter;
