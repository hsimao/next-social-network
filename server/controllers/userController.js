const mongoose = require("mongoose");
const User = mongoose.model("User");

// 取得所有用戶資料
exports.getUsers = async (req, res) => {
  const users = await User.find().select("_id name email created updatedAt");
  res.json(users);
};

exports.getAuthUser = () => {};

// 用 id 取得用戶資料, 並驗證該 id 是否為當前登入用戶
// 1. 將從資料庫找到的會員資料存到 req.profile
// 2. 用 mongoose.Types.ObjectId 轉換來驗證 _id
// 3. 驗證當前取得的用戶 id 是否為當前 session 儲存的 req.user._id,
// 4. 是的話將 req.isAuthUser 設定為 true, 後續各項 user 相關路由權限將可用來判斷
exports.getUserById = async (req, res, next, id) => {
  const user = await User.findOne({ _id: id });
  req.profile = user;

  const profileId = mongoose.Types.ObjectId(req.profile._id);

  if (profileId.equals(req.user._id)) {
    req.isAuthUser = true;
    return next();
  }
  next();
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
