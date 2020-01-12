const UserModel = require("../model/usermodel");

module.exports.deleteUser = async (req, res) => {
  let id = req.params["id"];
  // let id = req.params["id"];
  if(req.headers.user._id!==id&&req.headers.user.role!=="admin"){
    res.status(401).json({
        message:"Unauthorised request"
    });
  }
  try {
    var result = await UserModel.findByIdAndDelete(id);
    res.status(201).json({
      ans: result
    });
  } catch (err) {
    // console.log(err);
    res.status(401).json({
      status: "bad request"
    });
  }
};
module.exports.getUser = async (req, res) => {
  // console.log(req.params);
  let id = req.params["id"];
  try {
    var result = await UserModel.findById(id);
    // var result = await UserModel.find({_id:id});
    res.status(201).json({
      ans: result
    });
  } catch (err) {
    // console.log(err);
    res.status(401).json({
      status: "bad request"
    });
  }
};
module.exports.getAllUser = async (req, res) => {
  try {
    let query = req.query;
    // value
    let queryObj = { ...query };
    // // filter parameters=> sort,pagination,filter,limit 
    let ExcludefromQuery = ["filter", "limit", "page", "sort"];

    for (let i = 0; i < ExcludefromQuery.length; i++) {
      delete queryObj[ExcludefromQuery[i]];
    }
    let queryString = JSON.stringify(queryObj);
    // // /\b(gt|gte|lte|lt)\b/g

    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, function(match) {
      return "$" + match;
    });
    queryObj = JSON.parse(queryString);
    let result = UserModel.find(queryObj);

    // console.log(result);
    console.log(query);

    // sort
    if (query.sort) {
      //  price%ratingsAverage
      var args = query.sort.split("%").join(" ");
      // sort("price ratingsAverage");
      result = result.sort(args);
    }
    // // filter
    if (query.filter) {
      //
      var args = query.filter.split(",").join(" ");
      result = result.select(args);
      // sort("price ratingsAverage");
      // result = result.sort(args);
    } else {
      result = result.select("-__v");
    }
    // // pagination
    let limit = Number(query.limit) || 2;
    // // client
    let page = Number(query.page) || 1;

    let ElementToskip=(page-1)*limit;
    result=result.skip(ElementToskip).limit(limit);
    // Query Execution

    let finalresult = await result;

    res.status(200).json({
      result: finalresult
    });
  } catch (err) {
    res.status(401).json({
      response: "data not found",
      err: err
    });
  }
};
module.exports.updateUser = async (req, res) => {
  let id = req.params["id"];
  if(String(req.headers.user._id)!==String(id)&&req.headers.user.role!=="admin"){
    res.status(401).json({
        message:"Unauthorised request"
    });
    return;
  }
  delete req.body.role;
  try {
    // name:steve
    // name:stevenson
    var result = await UserModel.findByIdAndUpdate(id, req.body,{ new: true });
    // console.log(result);
    res.status(201).json({ status: "User data updated", result: result });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};
module.exports.createUser = async (req, res) => {
  req.body.role="user";
  try {
    // request
    var result = await UserModel.create(req.body);
    res.status(201).json({
      ans: result
    });
  } catch (err) {
    // console.log(err);
    res.status(401).json({
      status: err
    });
  }
};
