/* eslint-disable no-unused-vars */
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DialogContentText } from '@material-ui/core';
import range from './range';
import useMap from './useMap';
import { GeneralContext } from '../Contexts/GeneralProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import './Pins.css';

export default function PinsBottom() {
  const { actuation, clearAll } = React.useContext(ActuationContext);
  const { currElec } = React.useContext(GeneralContext);

  const [open, setOpen] = React.useState(false);
  const [pin, setPin] = React.useState(null);
  const [tempPin, setTempPin] = React.useState(null);

  useMap(() => {
    setPin(null);
  }, pin);

  React.useEffect(() => {
    if (currElec && actuation.history.length) {
      setOpen(true);
    } else {
      setPin(tempPin);
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
              setOpen(false);
              clearAll();
              setPin(tempPin);
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
          range(169, 175).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e.target.innerText)}>REF</button>
        {
          range(176, 182).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e.target.innerText)}>REF</button>
        {
          range(183, 189).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e.target.innerText)}>REF</button>
        {
          range(190, 196).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={(e) => setTempPin(e.target.innerText)}>REF</button>
      </div>
      <div className="row">
        {
          range(168, 137).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(41, 64).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
        {
          range(129, 136).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(40, 9).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setTempPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
