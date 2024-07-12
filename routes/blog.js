const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const Blog = require("../models/blog");
const Comment = require("../models/comments");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      // Define the path to the user's directory
      const userDir = path.join('./public/uploads');

      // Create the directory if it doesn't exist
      fs.mkdirSync(userDir, { recursive: true });

      cb(null, userDir);
  },
  filename: function (req, file, cb) {
      const uniquePrefix = Date.now();
      cb(null, uniquePrefix + '-' + file.originalname);
  }
});


const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});


router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({blogId:req.params.id}).populate("createdBy");
  return res.render("blog",{
    user:req.user,
    blog,
    comments,
  })
});


router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});


module.exports = router;
