const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const multer = require("multer");
const jimp = require("jimp");

// multer 參數設定
const imageUploadOptions = {
  storage: multer.memoryStorage(),
  limits: {
    // 檔案大小最大為 1mb
    fileSize: 1024 * 1024 * 1
  },
  fileFilter: (req, file, next) => {
    if (file.mimetype.startsWith("image/")) {
      next(null, true);
    } else {
      next(null, false);
    }
  }
};

// 接受一個以 image 命名的文件。這個文件的信息保存在 req.file
exports.uploadImage = multer(imageUploadOptions).single("image");

// 上傳文章的圖片尺寸更新為寬度 750px
// 更新完後儲存到 /static/uploads
exports.resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.image = `/static/uploads/${req.user.name}-${
    req.user._id
  }-${Date.now()}.${extension}`;
  const image = await jimp.read(req.file.buffer);
  await image.resize(750, jimp.AUTO);
  await image.write(`./${req.body.image}`);
  next();
};

exports.addPost = async (req, res) => {
  req.body.postedBy = req.user._id;
  const post = await new Post(req.body).save();
  await Post.populate(post, {
    path: "postedBy",
    select: "_id name avatar"
  });
  res.json(post);
};

exports.deletePost = () => {};

exports.getPostById = () => {};

exports.getPostsByUser = () => {};

exports.getPostFeed = () => {};

exports.toggleLike = () => {};

exports.toggleComment = () => {};
