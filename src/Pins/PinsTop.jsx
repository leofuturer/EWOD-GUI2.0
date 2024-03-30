/* eslint-disable linebreak-style */
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

export default function PinsTop() {
  const { actuation, clearAll } = React.useContext(ActuationContext);
  const { currElec } = React.useContext(GeneralContext);

  const [open, setOpen] = React.useState(false);
  const [mapPin, setMapPin] = React.useState(null);
  const [tempPin, setTempPin] = React.useState(null);
  useMap(() => {
    setMapPin(null);
  }, mapPin);

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
        <DialogTitle id="alert-dialog-title">Are you sure you want to change pin mappings?</DialogTitle>
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
      <div className="row">
        {
          range(97, 128).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(96, 65).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(225, 256).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row" style={{ marginBottom: 40 }}>
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(224, 218).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(217, 211).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(210, 204).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e)}>REF</button>
        {
          range(203, 197).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
