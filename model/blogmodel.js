const mongoose = require("mongoose");
const validator = require("validator");
let {dbpass}=require("../utils/config");
const DB =
  "mongodb+srv://dbAdmin:"+dbpass+"@cluster0-pmytc.mongodb.net/test?retryWrites=true&w=majority";
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(conn => {
    // console.log(conn);
    console.log("Connected to Blogs DB!");
  }).catch(err=>{
      console.log(err);
      
  });
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true
  },
  comments: [{ body: String, date: Date }],
  tags: [{ type: String, validate: validator.isAlpha }],
  dateCreated: {
    type: Date,
    default: Date.now   
  },
  dateModified:{
    type: Date,
    default: Date.now
  },
  body:{
      type:String,
      required:true
  },
  hidden: {
    type: Boolean,
    default: false
  },
  pictureLink: {
    type: String,
    default:
      "https://francis.ventures/wp-content/uploads/2018/03/nest-blog-banner.jpg",
    validate: validator.isURL
  }
});
const BlogModel=mongoose.model("BlogModel",blogSchema);
module.exports=BlogModel;
