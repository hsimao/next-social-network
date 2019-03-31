import Button from "@material-ui/core/Button";

import { followUser, unfollowUser } from "../../lib/api";

// 依照 isFollowing 來選用對應 API
// 並將 API 傳給父層 toggleFollow 方法來執行
const FollowUser = ({ isFollowing, toggleFollow }) => {
  const request = isFollowing ? unfollowUser : followUser;

  return (
    <Button
      variant="contained"
      color={isFollowing ? "default" : "secondary"}
      onClick={() => toggleFollow(request)}
    >
      {isFollowing ? "取消追蹤" : "追蹤"}
    </Button>
  );
};

export default FollowUser;
