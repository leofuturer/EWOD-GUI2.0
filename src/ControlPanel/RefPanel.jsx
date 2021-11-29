import React from 'react';
import Button from '@material-ui/core/Button';
// import ButtonGroup from '@material-ui/core/ButtonGroup';
// import CancelIcon from '@material-ui/icons/Cancel';
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import { makeStyles } from '@material-ui/styles';
// import icons from '../Icons/icons';

// const useStyles = makeStyles({
//   transparentBtn: {
//     border: 'none',
//   },
//   brownBtn: {
//     border: '2px solid #A06933',
//     color: '#FEFAE0',
//     backgroundColor: '#D4A373',
//     fontWeight: 900,
//     fontSize: '14px',
//     textTransform: 'none',
//     boxShadow: 'inset 0px 3px 4px rgba(250, 237, 205, 0.5)',
//   },
//   grayBtn: {
//     border: '2px solid #7D7B79',
//     color: '#FEFAE0',
//     backgroundColor: '#AEAEAE',
//     fontWeight: 900,
//     fontSize: '14px',
//     textTransform: 'none',
//     boxShadow: 'inset 0px 3px 4px rgba(255, 255, 255, 0.5)',
//   },
// });

export default function RefPanel() {
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          alert('hi');
        }}
        size="small"
      >
        Hello
      </Button>

    </div>
  );
}
