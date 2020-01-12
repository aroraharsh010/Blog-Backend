const UserModel = require("../model/usermodel");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = "secretKey";
const crypto = require("crypto");
let { sendEmail } = require("../utils/email");
module.exports.authorizeeasy = (req, res, next) => {
    if (req.headers.role === "admin" || req.headers.role === "writer") {
      next();
    } else {
      res.end("user is not authorized");
    }
  };
  module.exports.authorize = function(...args) {
    let roles = args;
    return function(req, res, next) {
      if (roles.includes(req.headers.role)) {
        next();
      } else {
        res.end("user is not authorized");
      }
    };
  };
module.exports.loginUser = async (req, res) => {
  try {
    let data = req.body;
    let { email, password } = data;
    if (!email || !password) {
      res.end("Email or Password is not present!");
      return;
    }
    let userData = await UserModel.findOne({
      email: email
    });
    if (!userData) {
      res.end("User Not Found!");
      return;
    }
    let dbPassword = userData.password;
    let ans = await bcrypt.compare("" + password, dbPassword);
    if (!ans) {
      res.end("Wrong Password!");
      return;
    }
    //   res.status(200).end("user logged in");
    const JWTtoken = jsonwebtoken.sign({ result: userData["_id"] }, secret, {
      expiresIn: "2d"
    });
    res.cookie("jwt", JWTtoken, { httpOnly: true });
    res.status(201).json({
      status: "Success Login",
      token: JWTtoken,
      message: "Welcome " + userData.name
    });
  } catch (err) {
    console.log(err);
    res.status(501).json({
      message: "User not logged"
    });
  }
};
module.exports.isLoggedIn = async (req, res, next) => {
    try {
        // 1. check token exist's or not
        let token;
        if (req.cookies.jwt) {
          token = req.cookies.jwt;
          console.log(token);
          // 2. verify the token
          let decode = jsonwebtoken.verify(token, secret);
          if (!decode) {
            // res.end("User is not authenticated");
            return next();
          }
          console.log(decode);
          // 3. check that user associated with the token exist in db or not
          // user name:steve
          //role:admin
          const user = await UserModel.findById(decode.id);
          if (!user) {
            // res.end("user does not exist");
            return next();
          }
          // 4. password update
          // db => ADMIN,User
          // authorize
          req.headers.role = user.role;
          // pug file
          res.locals.user = user;
          return next();
        } else {
          return next();
        }
      } catch (err) {
        res.json(err);
        // console.log(err);
        return next();
      }
};
module.exports.logoutUser = async (req, res) => {
  res.cookie("jwt", "Logged Out", {
    expires: new Date(Date.now() + 20),
    httpOnly: true
  });
  res.status(201).json({
    status: "Success LogOut",
    message: "User Logged Out"
  });
};
module.exports.userSignUp = async (req, res) => {
  try {
    let data = req.body;
    data.role="user";
    //   let email = data.email;
    //   let password = data.password;
    let { email, password } = data;
    if (!email || !password) {
      res.end("Email or Password is not present!");
    }
    let user = await UserModel.create(data);
    const token = jsonwebtoken.sign({ result: user._id }, secret, {
      expiresIn: "10d"
    });
    
    res.status(201).json({
      status: "Success SignUp",
      token,
      user
    });
    let message =
    "Welcome to Blog! " + user.name;
    try {
      sendEmail({
        receiverId: user.email,
        message: message,
        subject: "Welcome to Blog"
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    // res.end(err);
    console.log(err);
  }
};
module.exports.protectRoute = async (req, res, next) => {
    try {
        // 1. check token exist's ot not
        // console.log(req.headers);
        // console.log(req.headers.authorization);
        let token;
        if (req.headers.authorization) {
          token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.jwt) {
          token = req.cookies.jwt;
        } else {
          res.end("User is not logged in ");
        }
        // 2. verify the token
        try {
          let decode = jsonwebtoken.verify(token, secret);
          const user = await UserModel.findById(decode.result);
          // console.log(user);
          if (!user) {
            res.end("user does not exist");
          }
          // 4. password update
          // db => ADMIN,User
          req.headers.role = user.role;
          req.headers.user = user;
          // user.password = undefined;
          res.locals.user = user;
          next();
        } catch (err) {
          return res.end("User is not authenticated");
        }
      } catch (err) {
        // res.json(err);
        console.log(err);
      }
};

module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  if (!email) {
    res.end("Please enter your email id");
  }
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    res.end("User not found");
  }
  let token = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  let message =
    "Your reset token is sent! Please visit /createPassword and change password using provided token \n Your token:" +
    token;
  try {
    sendEmail({
      receiverId: user.email,
      message: message,
      subject: "Token only valid for 10mins"
    });
    res.json({
      status: "Email Sent"
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.resetPassword = async (req, res) => {
  //1. get Token from user
  console.log(req.body);
  let token = req.body.token;
  if (!token) {
    res.end("Enter token");
  }

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  //2. verify token
  console.log(encryptedToken);
  let user = await UserModel.findOne({ resetToken: encryptedToken});
  if (!user) {
    res.end("Invalid Auth token");
    return;
  }
  //3. Update password
  console.log(user);
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.expiresIn = undefined;
  user.save();
  res.json({
    status: "User Password Updated"
  });
};
module.exports.updateMyPassword = async (req, res) => {
  //  currentPassword,NewPassword,confirmPassword
  console.log(req.body);
  const dbPassword = req.headers.user.password;
  // ui

  const password = req.body.currentPassword;
  console.log(dbPassword+" "+password);
  // db
  const user = req.headers.user;
  let ans = await bcrypt.compare("" + password, dbPassword);
  if (!ans) {
    // new Error("Password was wrong")
    res.end("password is wrong");
    return;
  }
  //  model user password update
  console.log(user);
  user.password = req.body.NewPassword;
  user.confirmPassword = req.body.confirmPassword;
  // validators
  user.save();
  // send tokens
  // const JWTtoken = jsonwebtoken.sign({ id: user._id }, secret, {
  //   expiresIn: "10d"
  // });
  // res.cookie("jwt", JWTtoken, { httpOnly: "true" });
  res.json({
    status: "user Password Updated"
  });
};
