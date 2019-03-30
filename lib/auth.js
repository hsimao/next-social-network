import Router from "next/router";
import axios from "axios";

const WINDOW_USER_SCRIPT_VARIABLE = "__USER__";

export const getUserScript = user => {
  return `${WINDOW_USER_SCRIPT_VARIABLE} = ${JSON.stringify(user)};`;
};

export const getSessionFromServer = req => {
  if (req.user) {
    return { user: req.user };
  }
  return {};
};

export const getSessionFromClient = () => {
  if (typeof window !== "undefined") {
    const user = window[WINDOW_USER_SCRIPT_VARIABLE] || {};
    return { user };
  }
  return { user: {} };
};

const redirectUser = (res, path) => {
  if (res) {
    res.redirect(302, path);
    res.finished = true;
    return {};
  }
  Router.replace(path);
  return {};
};

// 驗證權限 ( 可接收一個參數 true / false )
// 1.) 使用 req 來判斷該請求是 client side 或 server side
// 2.) 是 server 就調用 getSessionFromServer 方法, 從後端 req.user 取得用戶資料
// 3.) 是 client 就調用 getSessionFromClient 方法 從瀏覽器 window 全域變數取得用戶資料
// 4.) 若有傳遞參數 且為 true, 則為保護頁面，若沒登入將會跳轉到 signin 頁面
// 5.) 若沒傳遞參數 或參數為 false, 則返回用戶資料
export const authInitialProps = isProtectedRoute => ({
  req,
  res,
  query: { userId }
}) => {
  const auth = req ? getSessionFromServer(req) : getSessionFromClient();
  const currentPath = req ? req.url : window.location.pathname;
  const user = auth.user;
  const isAnonymous = !user;
  if (isProtectedRoute && isAnonymous && currentPath !== "/signin") {
    return redirectUser(res, "/signin");
  }
  return { auth, userId };
};

// 註冊
// 1.) post signup API
export const signupUser = async user => {
  const { data } = await axios.post("/api/auth/signup", user);
  return data;
};

// 登入
// 1.) post signin API
// 2.) 將 user 資料儲存到瀏覽器 window 全域變數內
export const signinUser = async user => {
  const { data } = await axios.post("/api/auth/signin", user);
  if (typeof window !== "undefined") {
    window[WINDOW_USER_SCRIPT_VARIABLE] = data || {};
  }
};

// 登出
// 1.) get signout API
// 2.) 將 window 用戶資料的全域變數清空
// 3.) 返回登入頁面
export const signoutUser = async () => {
  if (typeof window !== " undefined") {
    window[WINDOW_USER_SCRIPT_VARIABLE] = {};
  }
  await axios.get("/api/auth/signout");
  Router.push("/signin");
};
