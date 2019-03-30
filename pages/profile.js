// import Paper from "@material-ui/core/Paper";
// import List from "@material-ui/core/List";
// import ListItem from "@material-ui/core/ListItem";
// import ListItemAvatar from "@material-ui/core/ListItemAvatar";
// import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
// import ListItemText from "@material-ui/core/ListItemText";
// import Avatar from "@material-ui/core/Avatar";
// import IconButton from "@material-ui/core/IconButton";
// import Typography from "@material-ui/core/Typography";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import Divider from "@material-ui/core/Divider";
// import Edit from "@material-ui/icons/Edit";
import withStyles from "@material-ui/core/styles/withStyles";

import { authInitialProps } from "../lib/auth";

class Profile extends React.Component {
  state = {};

  render() {
    return <div>Profile</div>;
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
