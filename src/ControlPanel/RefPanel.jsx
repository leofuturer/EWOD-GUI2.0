/* eslint-disable linebreak-style */
import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// import ButtonGroup from '@material-ui/core/ButtonGroup';
// import CancelIcon from '@material-ui/icons/Cancel';
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import { makeStyles } from '@material-ui/styles';
import icons from '../Icons/icons';

// const useStyles = makeStyles({
//   transparentBtn: {
//     border: 'none',
//   },
//   brownBtn: {
//     border: '2px solid #A06933',
//     color: '#FEFAE0',
//     backgroundColor: '#D4A373',
//     margin: '5px auto',
//     fontWeight: 900,
//     fontSize: '14px',
//     width: '64px',
//     height: '25px',
//     textTransform: 'none',
//     boxShadow: 'inset 0px 3px 4px rgba(250, 237, 205, 0.5)',
//   },
//   // bigBrownBorder: {
//   //   display: 'flex',
//   //   width: '218px',
//   //   height: '96px',
//   //   margin: '10px auto',
//   //   alignItems: 'center',
//   //   justifyContent: 'space-evenly',
//   //   border: '2px solid #D4A373',
//   //   borderRadius: '4px',
//   //   color: '#D4A373',
//   //   fontWeight: 900,
//   //   fontSize: '14px',

//   // },
//   smallBrownBorder: {
//     display: 'flex',
//     width: '218px',
//     height: '38px',
//     margin: '10px auto',
//     paddingRight: '5px',
//     paddingLeft: '5px',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//     border: '2px solid #D4A373',
//     borderRadius: '4px',
//   },
//   field: {
//     margin: '5px auto',
//     marginBottom: '20px',
//   },
//   centerBox: {
//     margin: '10px auto',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',

//   },
// });

export default function RefPanel() {
  // const classes = useStyles();

  return (
    <div>
      <div
        style={{
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
        }}
      >
        <div
          style={{
            margin: '10px auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img src={icons.search.icon} alt="Reference" />
          <Button
            sx={{
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
            }}
          >
            Import
          </Button>
          or drop files to upload.
        </div>
      </div>
      <div
        style={{
          margin: '10px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '218px',
            height: '38px',
            margin: '10px auto',
            paddingRight: '5px',
            paddingLeft: '5px',
            alignItems: 'center',
            justifyContent: 'space-around',
            border: '2px solid #D4A373',
            borderRadius: '4px',
          }}
        >
          <img src={icons.searchlogo.icon} alt="Search" />
          <TextField
            sx={{
              margin: '5px auto',
              marginBottom: '20px',
              '& input': {
                fontSize: '12px',
                color: '#D4A373',
                fontStyle: 'italic',
                fontWeight: 900,
              },
              '& label': {
                fontSize: '12px',
                color: '#D4A373',
                fontStyle: 'italic',
                fontWeight: 900,
              },
            }}
            label="Paste URL to file..."
          />
          <Button sx={{
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
          }}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
