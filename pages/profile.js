import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Edit from "@material-ui/icons/Edit";
import withStyles from "@material-ui/core/styles/withStyles";
import Link from "next/link";

import FollowUser from "../components/profile/FollowUser";
import DeleteUser from "../components/profile/DeleteUser";

import { authInitialProps } from "../lib/auth";
import { getUser } from "../lib/api";

class Profile extends React.Component {
  state = {
    user: null,
    isAuth: false,
    isFollowing: false,
    isLoading: true
  };

  componentDidMount() {
    const { userId, auth } = this.props;
    const isAuth = auth.user._id === userId;

    getUser(userId).then(user => {
      const isFollowing = this.checkFollow(auth, user);
      this.setState({ user, isAuth, isFollowing, isLoading: false });
    });
  }

  // 檢查當下頁面用戶是否已經追蹤
  checkFollow = (auth, user) => {
    return (
      user.followers.findIndex(follower => follower._id === auth.user._id) > -1
    );
  };

  toggleFollow = sendRequest => {
    const { userId } = this.props;
    const { isFollowing } = this.state;

    sendRequest(userId).then(() => {
      this.setState({ isFollowing: !isFollowing });
    });
  };

  render() {
    const { classes } = this.props;
    const { isLoading, user, isAuth, isFollowing } = this.state;

    return (
      <Paper className={classes.root} elevation={4}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          className={classes.title}
          gutterBottom
        >
          個人資料
        </Typography>
        {isLoading ? (
          <div className={classes.progressContainer}>
            <CircularProgress
              className={classes.progress}
              size={55}
              thickness={5}
            />
          </div>
        ) : (
          <List dense>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={user.avatar} className={classes.bigAvatar} />
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.email} />
              {/* 本人 - 編輯、刪除按鈕 / 非本人 - 追蹤按鈕 */}
              {isAuth ? (
                <ListItemSecondaryAction>
                  <Link href="/edit-profile">
                    <a>
                      <IconButton color="primary">
                        <Edit />
                      </IconButton>
                    </a>
                  </Link>
                  <DeleteUser user={user} />
                </ListItemSecondaryAction>
              ) : (
                <FollowUser
                  isFollowing={isFollowing}
                  toggleFollow={this.toggleFollow}
                />
              )}
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={user.about}
                secondary={`註冊時間：${user.createdAt}`}
              />
            </ListItem>
          </List>
        )}
      </Paper>
    );
  }
}

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 5,
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      width: 600
    }
  },
  title: {
    color: theme.palette.primary.main
  },
  progress: {
    margin: theme.spacing.unit * 2
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  },
  bigAvatar: {
    width: 60,
    height: 60,
    margin: 10
  }
});

/*
  使用 authInitialProps 進行驗證，傳遞參數 true 表示為保護路線
  該頁須已登入過才能訪問，若無登入將轉跳到登入頁面
  將 auth { auth, userId } 資料傳遞到該頁 props
*/
Profile.getInitialProps = authInitialProps(true);

export default withStyles(styles)(Profile);
