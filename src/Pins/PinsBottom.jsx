/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogContentText } from '@mui/material';
import range from './range';
import useMap from './useMap';
import { GeneralContext } from '../Contexts/GeneralProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { setPin } from '../USBCommunication/USBCommunication';
import './Pins.css';

export default function PinsBottom() {
  const { actuation, clearAll } = React.useContext(ActuationContext);
  const { currElec } = React.useContext(GeneralContext);

  const [open, setOpen] = React.useState(false);
  const [mapPin, setMapPin] = React.useState(null);
  const [tempPin, setTempPin] = React.useState(null);

  useMap(() => {
    setMapPin(null);
  }, mapPin);
  // using the event (e) from the click for the useeffect rather than the pin number
  // this allows you to select the pin twice and get it to toggle!
  React.useEffect(() => {
    if (currElec && actuation.history.length && tempPin) {
      setOpen(true);
    } else if (tempPin) {
      setMapPin(tempPin.target.innerText);
    }
  }, [tempPin]);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => { setOpen(false); }}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to change pin mappings?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            After clicking Confirm, all actuation steps you made will be deleted permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); }} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setPin([], 0, true).then(() => {
                clearAll();
                setMapPin(tempPin.target.innerText);
                setOpen(false);
              });
            }}
            color="primary"
            autoFocus
            data-testid="delete-button"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <div className="row" style={{ marginTop: 57 }}>
        {
          range(169, 175).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(176, 182).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(183, 189).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(190, 196).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
      </div>
      <div className="row">
        {
          range(168, 137).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(41, 64).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        {
          range(129, 136).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(40, 9).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
