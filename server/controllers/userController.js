const mongoose = require("mongoose");
const User = mongoose.model("User");

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

exports.getUserProfile = () => {};

exports.getUserFeed = () => {};

exports.uploadAvatar = () => {};

exports.resizeAvatar = () => {};

exports.updateUser = () => {};

// 刪除用戶, 刪除前需確認刪除的 id 是否為當下登入用戶
exports.deleteUser = async (req, res) => {
  console.log("deleteUser");

  const { userId } = req.params;
  if (!req.isAuthUser) {
    return res.status(400).json({
      message: "非用戶本人，無權限刪除"
    });
  }
  const deletedUser = await User.findOneAndDelete({ _id: userId });
  res.json(deletedUser);
};

exports.addFollowing = () => {};

exports.addFollower = () => {};

exports.deleteFollowing = () => {};

exports.deleteFollower = () => {};
