const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");

const router = express.Router();

/* Error handler for async / await functions */
const catchErrors = fn => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

/**
 * AUTH ROUTES: /api/auth
 */

// 註冊路由 api
// 1.) 先執行 validateSignup, 驗證資料正確性
// 2.) 若沒錯誤，將執行 signup 進行註冊
router.post(
  "/api/auth/signup",
  authController.validateSignup,
  catchErrors(authController.signup)
);
router.post("/api/auth/signin", authController.signin);
router.get("/api/auth/signout", authController.signout);

/**
 * USER ROUTES: /api/users
 */
// 使用 :userId 的 api 路由, 都會進行 getUserById 方法處理
router.param("userId", userController.getUserById);

// 追蹤用戶 / 新增追隨者 (addFollowing 跟 addFollower 是連動的, 在 addFollowing 執行完後需接著執行 addFollower)
router.put(
  "/api/users/follow",
  authController.checkAuth,
  catchErrors(userController.addFollowing),
  catchErrors(userController.addFollower)
);
router.put(
  "/api/users/unfollow",
  authController.checkAuth,
  catchErrors(userController.deleteFollowing),
  catchErrors(userController.deleteFollower)
);

router
  .route("/api/users/:userId")
  .get(userController.getAuthUser)
  .put(
    authController.checkAuth,
    userController.uploadAvatar,
    catchErrors(userController.resizeAvatar),
    catchErrors(userController.updateUser)
  )
  .delete(authController.checkAuth, catchErrors(userController.deleteUser));

router.get("/api/users", userController.getUsers);
router.get("/api/users/profile/:userId", userController.getUserProfile);
router.get(
  "/api/users/feed/:userId",
  authController.checkAuth,
  catchErrors(userController.getUserFeed)
);

/**
 * POST ROUTES: /api/posts
 */
// 使用 :postId 的 api 路由, 都會執行 getPostById 方法進行驗證
router.param("postId", postController.validatePostId);

router.put(
  "/api/posts/like",
  authController.checkAuth,
  catchErrors(postController.toggleLike)
);
router.put(
  "/api/posts/unlike",
  authController.checkAuth,
  catchErrors(postController.toggleLike)
);

router.put(
  "/api/posts/comment",
  authController.checkAuth,
  catchErrors(postController.toggleComment)
);
router.put(
  "/api/posts/uncomment",
  authController.checkAuth,
  catchErrors(postController.toggleComment)
);

router.delete(
  "/api/posts/:postId",
  authController.checkAuth,
  catchErrors(postController.validatePoster),
  catchErrors(postController.deletePost)
);

router.post(
  "/api/posts/new/:userId",
  authController.checkAuth,
  postController.uploadImage,
  catchErrors(postController.resizeImage),
  catchErrors(postController.addPost)
);
router.get("/api/posts/by/:userId", catchErrors(postController.getPostsByUser));
router.get("/api/posts/feed/:userId", catchErrors(postController.getPostFeed));

module.exports = router;
