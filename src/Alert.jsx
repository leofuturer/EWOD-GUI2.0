import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    top: 60,
    left: 'calc(50% - 250px)',
    height: 30,
    width: 500,
    zIndex: 3,
  },
});

const CustomAlert = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('Invalid Input!');
  const [severity, setSevertity] = useState('error');
  useImperativeHandle(
    ref,
    () => ({
      getAlert(severe, alertText) {
        setText(alertText);
        setSevertity(severe);
        setOpen(true);
      },
    }),
  );
  const classes = useStyles();
  return (
    <Collapse in={open} className={classes.container}>
      <Alert
        severity={severity}
        action={(
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
        data-testid={`alert-box-${severity}`} // for jest testing
      >
        {`${text}`}
      </Alert>
    </Collapse>
  );
});

export default CustomAlert;
