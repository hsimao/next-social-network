import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Delete from "@material-ui/icons/Delete";
import withStyles from "@material-ui/core/styles/withStyles";

import { signoutUser } from "../../lib/auth";
import { deleteUser } from "../../lib/api";

class DeleteUser extends React.Component {
  state = {
    open: false,
    isDeleting: false
  };

  handleDeleteUser = () => {
    const { user } = this.props;

    this.setState({ isDeleting: true });

    deleteUser(user._id)
      .then(() => {
        signoutUser();
      })
      .catch(err => {
        console.error(err);
        this.setState({ isDeleting: false });
      });
  };

  handleOpen = () => this.setState({ open: true });
  handleClose = () => this.setState({ open: false });

  render() {
    const { classes } = this.props;
    const { open, isDeleting } = this.state;
    return (
      <div>
        <IconButton onClick={this.handleOpen} className={classes.iconButton}>
          <Delete />
        </IconButton>

        {/* 刪除提示彈窗 */}
        <Dialog open={open} onClose={this.handleClose}>
          <DialogTitle>
            <div className={classes.dialogTitle}>刪除帳號</div>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <DialogContentText>確認要刪除帳號嗎？</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} className={classes.cancelBtn}>
              取消
            </Button>
            <Button
              onClick={this.handleDeleteUser}
              className={classes.deleteBtn}
              disabled={isDeleting}
            >
              {isDeleting ? "刪除中..." : "刪除"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const styles = theme => ({
  dialogContent: {
    minWidth: "40vw"
  },
  cancelBtn: {
    color: "rgba(0, 0, 0, 0.54)"
  },

  iconButton: {
    color: theme.palette.accent.light
  },
  deleteBtn: {
    color: theme.palette.accent.light
  },
  dialogTitle: {
    color: theme.palette.accent.light
  }
});

export default withStyles(styles)(DeleteUser);
