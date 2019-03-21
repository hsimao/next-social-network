const mongoose = require("mongoose");
const User = mongoose.model("User");

// 檢查註冊資料
exports.validateSignup = (req, res, next) => {
  // 使用 sanitizeBody 刪除可能在 JavaScript 跨站點腳本攻擊中使用的 HTML 字符
  req.sanitizeBody("name");
  req.sanitizeBody("email");
  req.sanitizeBody("password");

  // name 資料不可為空，字元長度必須為 2 ~ 10 字元之間
  req.checkBody("name", "姓名為必填資料").notEmpty();
  req.checkBody("name", "姓名長度必須為 2 ~ 10 字元之間").isLength({
    min: 2,
    max: 10
  });

  // email 資料不可為空，且須符合 email 格式
  req.checkBody("email", "信箱為必填資料").notEmpty();
  req
    .checkBody("email", "信箱格式不正確")
    .isEmail()
    .normalizeEmail();

  // password 資料不可為空，長度必須為 4 ~ 16 字元之間
  req.checkBody("password", "密碼為必填資料").notEmpty();
  req.checkBody("password", "密碼長度必須為 4 ~ 16 字元之間").isLength({
    min: 4,
    max: 16
  });

  // 錯誤處理
  // 1.) 回傳錯誤狀態 (400 錯誤請求)
  // 2.) 抓出第一筆錯誤訊息並回傳
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).send(firstError);
  }
  next();
};

// 註冊
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await new User({ name, email, password });
  await User.register(user, password, (err, user) => {
    if (err) {
      // 註冊失敗, 回傳錯誤訊息 (500 內部服務器錯誤)
      return res.status(500).send(err.message);
    }
    res.json(user);
  });
};

exports.signin = () => {};

exports.signout = () => {};

exports.checkAuth = () => {};
