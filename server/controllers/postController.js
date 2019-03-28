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

// 取得指定用戶文章列表
exports.getPostsByUser = async (req, res) => {
  const posts = await Post.find({ postedBy: req.profile._id }).sort({
    createdAt: -1 // 1(升序) -1(降序)
  });
  res.json(posts);
};

// 抓出指定用戶的所有追蹤者文章, 包含這位用戶文章
exports.getPostFeed = async (req, res) => {
  const { following, _id } = req.profile;

  following.push(_id);
  const posts = await Post.find({ postedBy: { $in: following } }).sort({
    createdAt: -1
  });
  res.json(posts);
};

// like 文章 ( 接收postId )
// 1.) 抓出文章所有已 like 用戶 id
// 2.) 將所有用戶 id, 當前用戶 id 轉成字串
// 3.) 使用字串方法 ( includes ) 判斷是否已經存在 ( 已點過 like )
// 4.) 已點過就 unlike, 尚未點過就 like
exports.toggleLike = async (req, res) => {
  const { postId } = req.body;

  const post = await Post.findOne({ _id: postId });
  const likeIds = post.likes.map(id => id.toString());
  const authUserId = req.user._id.toString();
  if (likeIds.includes(authUserId)) {
    await post.likes.pull(authUserId);
  } else {
    await post.likes.push(authUserId);
  }
  await post.save();
  res.json(post);
};

exports.toggleComment = () => {};
