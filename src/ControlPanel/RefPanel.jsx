import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
// import ButtonGroup from '@material-ui/core/ButtonGroup';
// import CancelIcon from '@material-ui/icons/Cancel';
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { makeStyles } from '@material-ui/styles';
import icons from '../Icons/icons';

const useStyles = makeStyles({
  transparentBtn: {
    border: 'none',
  },
  brownBtn: {
    border: '2px solid #A06933',
    color: '#FEFAE0',
    backgroundColor: '#D4A373',
    margin: '5px auto',
    fontWeight: 900,
    fontSize: '14px',
    width: '64px',
    height: '25px',
    textTransform: 'none',
    boxShadow: 'inset 0px 3px 4px rgba(250, 237, 205, 0.5)',
  },
  bigBrownBorder: {
    display: 'flex',
    width: '218px',
    height: '96px',
    margin: '10px auto',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    border: '2px solid #D4A373',
    borderRadius: '4px',
    color: '#D4A373',
    fontWeight: 900,
    fontSize: '14px',

  },
  smallBrownBorder: {
    display: 'flex',
    width: '218px',
    height: '38px',
    margin: '10px auto',
    paddingRight: '5px',
    paddingLeft: '5px',
    alignItems: 'center',
    justifyConent: 'space-around',
    border: '2px solid #D4A373',
    borderRadius: '4px',
  },
  field: {
    margin: '5px auto',
    marginBottom: '20px',
  },
  centerBox: {
    margin: '10px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

  },
});

export default function RefPanel() {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.bigBrownBorder}>
        <div className={classes.centerBox}>
          <img src={icons.search.icon} alt="Reference" />
          <Button className={classes.brownBtn}>
            Import
          </Button>
          or drop files to upload.
        </div>
      </div>
      <div className={classes.centerBox}>
        <div className={classes.smallBrownBorder}>
          <img src={icons.searchlogo.icon} alt="Search" />
          <TextField
            className={classes.field}
            label="Paste URL to a file..."
            inputProps={{
              style: {
                fontSize: '12px',
                color: '#D4A373',
                fontStyle: 'italic',
                fontWeight: 900,
              },
            }}
            InputLabelProps={{
              style: {
                fontSize: '12px',
                color: '#D4A373',
                fontStyle: 'italic',
                fontWeight: 900,
              },
            }}
          />
          <Button className={classes.brownBtn}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
