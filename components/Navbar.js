import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ShareOutlined from "@material-ui/icons/ShareOutlined";
import withStyles from "@material-ui/core/styles/withStyles";

import ActiveLink from "./ActiveLink";

import { signoutUser } from "../lib/auth";

const Navbar = ({ classes, router, pageProps: { auth } }) => {
  const { user = {} } = auth || {};
  return (
    <AppBar
      className={classes.appBar}
      position={router.pathname === "/" ? "fixed" : "static"}
    >
      <Toolbar>
        {/*  Main title / Home Button */}
        <ActiveLink href="/">
          <ShareOutlined className={classes.icon} />
        </ActiveLink>
        <Typography
          variant="h5"
          component="h1"
          color="inherit"
          className={classes.toolbarTitle}
        >
          <ActiveLink href="/">NextConnect</ActiveLink>
        </Typography>

        {user._id ? (
          // 已登入功能按鈕
          <div>
            <Button color="inherit">
              <ActiveLink href={`/profile/${user._id}`}>個人資料</ActiveLink>
            </Button>
            <Button onClick={signoutUser} color="inherit" variant="outlined">
              登出
            </Button>
          </div>
        ) : (
          // 未登入功能按鈕
          <div>
            <Button>
              <ActiveLink href="/signin">登入</ActiveLink>
            </Button>
            <Button color="inherit">
              <ActiveLink href="/signup">註冊</ActiveLink>
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

const styles = theme => ({
  appBar: {
    // z-index 1 higher than the fixed drawer in home page to clip it under the navigation
    zIndex: theme.zIndex.drawer + 1
  },
  toolbarTitle: {
    flex: 1
  },
  icon: {
    marginRight: theme.spacing.unit,
    marginTop: "8px"
  }
});

export default withStyles(styles)(Navbar);
