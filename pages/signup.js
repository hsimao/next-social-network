import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import AssignmentSharp from "@material-ui/icons/AssignmentSharp";
import VerifiedUserTwoTone from "@material-ui/icons/VerifiedUserTwoTone";
import withStyles from "@material-ui/core/styles/withStyles";
import Link from "next/link";

import { signupUser } from "../lib/auth";

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Signup extends React.Component {
  state = {
    name: "",
    email: "",
    password: "",
    error: "",
    createdUser: "",
    openError: false,
    openSuccess: false,
    isLoading: false
  };

  handleClose = () => this.setState({ openError: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    const { name, email, password } = this.state;
    this.setState({ isLoading: true, error: "" });
    event.preventDefault();

    const user = {
      name,
      email,
      password
    };

    signupUser(user)
      .then(createdUser => {
        this.setState({
          createdUser,
          error: "",
          openSuccess: true,
          isLoading: false
        });
      })
      .catch(this.showError);
  };

  showError = err => {
    const error = (err.response && err.response.data) || err.message;
    console.log("error", error);
    this.setState({ error: error, openError: true, isLoading: false });
  };

  render() {
    const { classes } = this.props;
    const {
      error,
      openError,
      openSuccess,
      createdUser,
      isLoading
    } = this.state;

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <div className={classes.head}>
            <AssignmentSharp className={classes.headIcon} />
            <Typography
              variant="h5"
              component="h1"
              className={classes.headText}
            >
              註冊
            </Typography>
          </div>

          <form onSubmit={this.handleSubmit} className={classes.form}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="name">姓名</InputLabel>
              <Input name="name" type="text" onChange={this.handleChange} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="email">Email</InputLabel>
              <Input name="email" type="email" onChange={this.handleChange} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">密碼</InputLabel>
              <Input
                name="password"
                type="password"
                onChange={this.handleChange}
              />
            </FormControl>
            <Button
              className={classes.submit}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "處理中..." : "送出"}
            </Button>
          </form>

          {/* 錯誤提示窗 */}
          {error && (
            <Snackbar
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
              }}
              open={openError}
              onClose={this.handleClose}
              autoHideDuration={6000}
              message={<span className={classes.snack}>{error}</span>}
            />
          )}
        </Paper>

        {/* 成功彈窗 */}
        <Dialog
          open={openSuccess}
          disableBackdropClick={true}
          TransitionComponent={Transition}
        >
          <DialogTitle>
            <VerifiedUserTwoTone className={classes.icon} />
            新帳號
          </DialogTitle>
          <DialogContent>
            <DialogContentText>用戶 {createdUser} 已註冊成功</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="contained">
              <Link href="/signin">
                <a className={classes.signinLink}>前往登入</a>
              </Link>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    width: "auto",
    display: "block",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up("md")]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  head: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  headIcon: {
    marginRight: theme.spacing.unit,
    marginTop: "2px",
    fontSize: "30px",
    color: theme.palette.primary.main
  },
  headText: {
    color: theme.palette.primary.main
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing.unit * 2
  },
  signinLink: {
    textDecoration: "none",
    color: "white"
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%",
    marginTop: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 2
  },
  snackbar: {
    border: "solid 1px blue"
  },
  snack: {
    color: theme.palette.accent.light
  },
  icon: {
    padding: "0px 2px 2px 0px",
    verticalAlign: "middle",
    color: "green"
  }
});

export default withStyles(styles)(Signup);
