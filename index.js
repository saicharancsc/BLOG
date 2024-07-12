const dotenv = require('dotenv');

dotenv.config();

const express = require(`express`);
const path=require("path");
const userRoute=require("./routes/user");
const blogRoute=require("./routes/blog");
const mongoose=require("mongoose");
const cookieParser=require(`cookie-parser`);

const {
    checkForAuthenticationCookie,
  } = require("./middlewares/authentication");
const Blog=require("./models/blog")
  

const app = express();
const PORT= process.env.PORT ||2000;

//it is dynamical variable
//export PORT = some portno. 

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("connected to database");
});

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie(`token`));
app.use(express.static(path.resolve("./public")));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use((req, res, next) => {
    res.locals.user = req.user; // Assuming `req.user` contains the authenticated user
    next();
});

app.get("/", async (req,res) => {
    console.log('res.locals.user:', res.locals.user); // Log the user
    const allBlogs= await Blog.find({})
    res.render("home",{
        user:req.user,
        blogs:allBlogs
    });
});


app.use("/user",userRoute);
app.use("/blog",blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));






