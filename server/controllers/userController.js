const mongoose = require("mongoose");
const User = mongoose.model("User");
const multer = require("multer");
const jimp = require("jimp");

// 取得所有用戶資料
exports.getUsers = async (req, res) => {
  const users = await User.find().select("_id name email created updatedAt");
  res.json(users);
};

// 用 id 取得用戶資料, 並驗證該 id 是否為當前登入用戶
// 1. 驗證 :userId 是否符合 mongo ObjectId 格式
// 2. 將從資料庫找到的會員資料存到 req.profile
// 3. 使用 mongoose.Types.ObjectId() 來轉換 userId , 已便使用 equals() 方法來驗證
// 4. 驗證當前取得的用戶 id 是否為當前 session 儲存的 req.user._id,
// 5. 是的話將 req.isAuthUser 設定為 true, 後續各項 user 相關路由權限將可用來判斷
exports.getUserById = async (req, res, next, id) => {
  let userId = "";
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "id格式有誤" });
  } else {
    userId = id;
  }

  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res
      .status(404)
      .json({ message: "未找到該用戶，該用戶已經禁用或刪除" });
  }
  req.profile = user;

  const profileId = mongoose.Types.ObjectId(req.profile._id);

  if (req.user && profileId.equals(req.user._id)) {
    req.isAuthUser = true;
    return next();
  }
  next();
};

// 取得 user 資料
// 1. 確認當前是否已經有登入 或已經有 session, 有才回傳 session 儲存的 user 資料
exports.getAuthUser = (req, res, next) => {
  if (!req.isAuthUser) {
    // (403 禁止)
    return res.status(403).json({
      message: "此用戶尚未通過驗證，無權限取得資料"
    });
    res.redirect("/signin");
  }
  res.json(req.user);
};

// == 取得用戶個人詳細資料
// route: get /api/users/profile/:userId
// 1. 判斷 req.profile 內是否已經存有用戶資料, 有則回傳 (所有包含 :userId 相關路由皆會觸發 getUserById 驗證id並將資料儲存到 req.profile 內)
exports.getUserProfile = (req, res) => {
  if (!req.profile) {
    return res.status(404).json({
      message: "未找到用戶資訊"
    });
  }
  res.json(req.profile);
};

// 顯示當中可以追蹤的用戶
// 1. 將查詢用戶 id push 到 following 中以便查詢時排除自己(不可追蹤自己)
// 2. 使用 mongo $nin 不包含 查詢功能, 僅顯示沒有在 following 內的用戶
exports.getUserFeed = async (req, res) => {
  const { following, _id } = req.profile;

  following.push(_id);
  const users = await User.find({ _id: { $nin: following } }).select(
    "_id name avatar"
  );
  res.json(users);
};

// multer 參數設定
const avatarUploadOptions = {
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

// 接受一個以 avatar 命名的文件。這個文件的信息保存在 req.file
exports.uploadAvatar = multer(avatarUploadOptions).single("avatar");

// 大頭照尺寸更新為寬度 250
// 更新完後儲存到 /static/uploads/avatars/
exports.resizeAvatar = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.avatar = `/static/uploads/avatars/${req.user.name}-${
    req.user._id
  }.${extension}`;
  const image = await jimp.read(req.file.buffer);
  await image.resize(250, jimp.AUTO);
  await image.write(`./${req.body.avatar}`);
  next();
};

// 更新 user 資料
exports.updateUser = async (req, res) => {
  req.body.updatedAt = new Date().toISOString();
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: req.body },
    // 回傳最新資料，並啟用驗證，驗證規則對應 models/User.js 內的 userSchema
    { new: true, runValidators: true }
  );
  res.json(updatedUser);
};

// 刪除用戶, 刪除前需確認刪除的 id 是否為當下登入用戶
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (!req.isAuthUser) {
    return res.status(400).json({
      message: "非用戶本人，無權限刪除"
    });
  }
  const deletedUser = await User.findOneAndDelete({ _id: userId });
  res.json(deletedUser);
};

// 追蹤用戶 (接收值 followId)
// 追蹤用戶執行完後繼續接的執行 addFollower, 將自己資料更新再被追蹤者上
exports.addFollowing = async (req, res, next) => {
  const { followId } = req.body;

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { following: followId } }
  );
  next();
};

// 新增追隨者 (接收值 followId)
exports.addFollower = async (req, res) => {
  const { followId } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: followId },
    { $push: { followers: req.user._id } },
    { new: true } // 回傳更新完後的值
  );
  res.json(user);
};

// 取消追蹤 (接收值 followId)
exports.deleteFollowing = async (req, res, next) => {
  const { followId } = req.body;

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { following: followId } }
  );
  next();
};

// 刪除追蹤者 (接收值 followId)
exports.deleteFollower = async (req, res) => {
  const { followId } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: followId },
    { $pull: { followers: req.user._id } },
    { new: true }
  );
  res.json(user);
};
