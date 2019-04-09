import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Snackbar from "@material-ui/core/Snackbar";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import VerifiedUserTwoTone from "@material-ui/icons/VerifiedUserTwoTone";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CloudUpload from "@material-ui/icons/CloudUpload";
import FaceTwoTone from "@material-ui/icons/FaceTwoTone";
import EditSharp from "@material-ui/icons/EditSharp";
import withStyles from "@material-ui/core/styles/withStyles";

import { authInitialProps } from "../lib/auth";
import { getAuthUser, updateUser } from "../lib/api";

class EditProfile extends React.Component {
  state = {
    _id: "",
    name: "",
    email: "",
    about: "",
    avatar: "",
    avatarPreview: "",
    isLoading: true
  };

  componentDidMount() {
    const { auth } = this.props;

    this.userData = new FormData();
    getAuthUser(auth.user._id)
      .then(user => {
        this.setState({
          ...user,
          isLoading: false
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ isLoading: false });
      });
  }

  handleChange = event => {
    let inputValue;

    if (event.target.name === "avatar") {
      inputValue = event.target.files[0];
      this.setState({ avatarPreview: this.createPreviewImage(inputValue) });
    } else {
      inputValue = event.target.value;
    }
    this.userData.set(event.target.name, inputValue);
    this.setState({ [event.target.name]: inputValue });
  };

  // 圖像預覽
  createPreviewImage = file => URL.createObjectURL(file);

  handleSubmit = event => {
    event.preventDefault();
    updateUser(this.state._id, this.userData)
      .then(updateUser => {
        console.log(updateUser);
      })
      .catch(err => console.error(err));
  };

  render() {
    const { classes } = this.props;
    const { name, email, avatar, about, isLoading, avatarPreview } = this.state;
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <EditSharp />
          </Avatar>
          <Typography variant="h5" component="h1">
            編輯個人資料
          </Typography>

          {/* form */}
          <form className={classes.form}>
            {isLoading ? (
              <Avatar className={classes.bigAvatar}>
                <FaceTwoTone />
              </Avatar>
            ) : (
              // 沒有上傳新圖片時會顯示原本圖像
              <Avatar
                src={avatarPreview || avatar}
                className={classes.bigAvatar}
              />
            )}
            <input
              type="File"
              name="avatar"
              id="avatar"
              accept="image/*"
              onChange={this.handleChange}
              className={classes.input}
            />
            <label htmlFor="avatar" className={classes.uploadButton}>
              <Button variant="contained" color="secondary" component="span">
                上傳照片 <CloudUpload />
              </Button>
            </label>
            <span className={classes.filename}>{avatar && avatar.name}</span>

            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="name">姓名</InputLabel>
              <Input
                type="text"
                name="name"
                value={name}
                onChange={this.handleChange}
              />
            </FormControl>

            <FormControl margin="normal" fullWidth>
              <InputLabel htmlFor="about">關於</InputLabel>
              <Input
                type="text"
                name="about"
                value={about}
                onChange={this.handleChange}
              />
            </FormControl>

            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="email">信箱</InputLabel>
              <Input
                type="text"
                name="email"
                value={email}
                onChange={this.handleChange}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={this.handleSubmit}
            >
              儲存
            </Button>
          </form>
        </Paper>
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
  bigAvatar: {
    width: 60,
    height: 60,
    margin: "auto"
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0.25em"
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
  snack: {
    color: theme.palette.secondary.light
  },
  icon: {
    padding: "0px 2px 2px 0px",
    verticalAlign: "middle",
    color: "green"
  },
  input: {
    display: "none"
  }
});

/*
  使用 authInitialProps 進行驗證，傳遞參數 true 表示為保護路線
  該頁須已登入過才能訪問，若無登入將轉跳到登入頁面
  將 auth { auth, userId } 資料傳遞到該頁 props
*/
EditProfile.getInitialProps = authInitialProps(true);

export default withStyles(styles)(EditProfile);
