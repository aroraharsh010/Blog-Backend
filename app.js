const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const blogRouter = require("./router/blogRouter");
const userRouter=require("./router/userRouter");
const app = express();
const cookieParser=require("cookie-parser");
app.use(cookieParser(),(req,res,next)=>{
    next();
});
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Limit crossed by your IP" //Limit to each IP 100 requests every 15 mins
});
app.use(mongoSanitize());
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

app.use("/api/blogs", blogRouter);
app.use("/api/users",userRouter);
// app.use("/",);
module.exports = app;
