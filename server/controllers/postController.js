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

// 驗證文章 id ( 所有包含 :postId 的路由將執行此方法 )
// 1. 驗證 id 格式
// 2. 確認資料庫有該篇文章
exports.validatePostId = async (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "id格式有誤" });
  }

  await Post.findOne({ _id: id }, (err, res) => {
    if (!err) {
      req.post = res;
      next();
    } else {
      return res
        .state(404)
        .json({ message: `未找到該篇文章, error: ${err.message}` });
    }
  });
};

// 判斷文章是否為作者
// 1. 從 req.post 取得資料來驗證
// 2. 將 文章 postedBy id 轉為 mongo ObjectId 格式
// 3. 驗證是否有登入, 以及是否為創建者本人
// 4. 是本人則將 req.isPoster 設定為 true
exports.validatePoster = async (req, res, next) => {
  const posterId = mongoose.Types.ObjectId(req.post.postedBy._id);
  if (req.user && posterId.equals(req.user._id)) {
    req.isPoster = true;
    return next();
  }
  next();
};

// 刪除文章
exports.deletePost = async (req, res) => {
  const { _id } = req.post;
  if (!req.isPoster) {
    return res.status(400).json({
      message: "非文章擁有者，無權限刪除"
    });
  }
  const deletedPost = await Post.findOneAndDelete({ _id });
  res.json(deletedPost);
};

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

// 驗證 post id
exports.v;

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

// 新增、刪除留言 ( 接收 comment, postId )
// 1.) 使用 url 判斷 uncomment 或 comment, 來各別設定參數
// 2.) 新增留言需要傳遞 { postId: 'id', comment: { text: 'hello' } }
// 3.) 刪除留言需要傳遞 { postId: 'id', comment: { _id: 'id' } }
// 4.) 使用 postSchema populate, 來自動產生對應的 postedBy 值
exports.toggleComment = async (req, res) => {
  const { comment, postId } = req.body;
  let operator, data;

  if (req.url.includes("uncomment")) {
    operator = "$pull";
    data = { _id: comment._id };
  } else {
    // 新增留言, 傳遞 text 之外還要傳遞創建者 id 讓資料庫自動填充留言者資料
    operator = "$push";
    data = { text: comment.text, postedBy: req.user._id };
  }

  // 使用 postId 找到文章，新增留言或刪除留言
  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId },
    { [operator]: { comments: data } },
    { new: true }
  )
    .populate("postedBy", "_id name avatar")
    .populate("comments.postedBy", "_id name avatar");
  res.json(updatedPost);
};
