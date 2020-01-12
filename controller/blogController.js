const BlogModel = require("../model/blogmodel");

module.exports.createBlog = async (req, res) => {
  let user = req.headers.user;
  let role = user.role;
  if (role == "writer"||role=="admin") {
    req.body.authorId = user._id;
    req.body.authorName = user.name;
  } else {
    res.status(401).json({ 
      message: "Please obtain writer level first" 
    });
    return;
  }
  try {
    var result = await BlogModel.create(req.body);
    res.status(201).json({ result: result });
  } catch (err) {
    res.status(401).json({
      status: "bad request",
      err: err
    });
  }
};
module.exports.updateBlog = async (req, res) => {
  let id = req.params["id"];
  let user = req.headers.user;
  console.log(user);
  let role = user.role;
  let writerId = undefined;
  try {
    let blog = await BlogModel.findById(id);
    if (blog) {
      writerId = blog.authorId;
      if (String(writerId) != String(user._id)) {
        res.end("Unauthorised Request");
        return;
      }
    }
  } catch (err) {
    console.log(err);
    res.end(err);
  }
  if (role == "admin" || String(user._id) == String(writerId)) {
   
    try {
      req.body.dateModified=Date.now();
      let result = await BlogModel.findByIdAndUpdate(id, req.body, {
        new: true
      });
      res.status(200).json({
        result: result
      });
    } catch (err) {
      res.status(401).json({
        status: "Bad Request",
        err: err
      });
    }
  }
};
module.exports.getBlog = async (req, res) => {
  let id = req.params["id"];
  try {
    let result = await BlogModel.findById(id);
    res.status(200).json({
      result: result,
      message: "Success"
    });
  } catch (err) {
    res.status(401).json({
      status: "Bad Request",
      err: err
    });
  }
};
module.exports.deleteBlog = async (req, res) => {
  let id = req.params["id"];
  let user = req.headers.user;
  let role = user.role;
  let writerId = undefined;
  try {
    let blog = await BlogModel.findById(id);
    if (blog) {
      writerId = blog.authorId;
      if (String(writerId) != String(user._id)) {
        res.end("Unauthorised Request");
      }
    }
  } catch (err) {
    console.log(err);
  }
  if (role == "admin" || String(user._id) == String(writerId)) {
    try {
      let result = await BlogModel.findByIdAndDelete(id);
      res.status(200).json({
        result: result
      });
    } catch (err) {
      res.status(401).json({
        status: "Bad Request",
        err: err
      });
    }
  }
};
module.exports.getAllBlogs = async (req, res) => {
  try {
    var queryObj = { ...req.query };
    let excludeFromQuery = ["fields", "limit", "page", "sort"];
    let query = req.query;
    for (let i = 0; i < excludeFromQuery.length; i++) {
      delete queryObj[excludeFromQuery[i]];
    }
    // console.log(req.query);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => {
      return "$" + match;
    });
    queryObj = JSON.parse(queryString);
    let result = BlogModel.find(queryObj);
    if (query.sort) {
      var args = query.sort.split("%").join(" ");
      result = result.sort(args);
    }
    if (query.fields) {
      var args = query.fields.split("%").join(" ");
      result = result.select(args);
    } else {
      result = result.select("-__v");
    }
    let limitPerPage = Number(query.limit) || 2;
    let page = Number(query.page) || 1;
    let elementToskip = (page - 1) * limitPerPage;
    result = result.skip(elementToskip).limit(limitPerPage);
    res.status(200).json({
      result: await result
    });
  } catch (err) {
    res.status(401).json({
      status: "Bad Request",
      err: err
    });
  }
};
