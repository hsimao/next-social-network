// import CircularProgress from "@material-ui/core/CircularProgress";
// import Drawer from "@material-ui/core/Drawer";
// import Typography from "@material-ui/core/Typography";
// import Grid from "@material-ui/core/Grid";
// import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";

import { authInitialProps } from "../lib/auth";

class Index extends React.Component {
  state = {};

  render() {
    return <div>Index</div>;
  }
}

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 10,
    paddingLeft: theme.spacing.unit * 5,
    [theme.breakpoints.down("sm")]: {
      paddingRight: theme.spacing.unit * 5
    }
  },
  progressContainer: {
    height: "80vh"
  },
  progress: {
    margin: theme.spacing.unit * 2,
    color: theme.palette.secondary.light
  },
  drawerContainer: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  drawer: {
    width: 350
  },
  drawerPaper: {
    marginTop: 70,
    width: 350
  },
  fabButton: {
    margin: theme.spacing.unit * 3
  },
  heroContent: {
    maxWidth: 600,
    paddingTop: theme.spacing.unit * 8,
    paddingBottom: theme.spacing.unit * 6,
    margin: "0 auto"
  }
});

/*
  使用 authInitialProps 進行驗證
  authInitialProps 未傳遞參數, 表示此頁單純傳遞 auth 資料，不進行跳轉驗證保護
  將 auth { auth, userId } 資料傳遞到該頁 props
*/
Index.getInitialProps = authInitialProps();

export default withStyles(styles)(Index);
