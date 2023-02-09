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

  const [alert, setAlert] = React.useState(false);
  const [pin, setPin] = React.useState(null);
  const [tempPin, setTempPin] = React.useState(null);
  const clicked = (e) => {
    setTempPin(e.target.innerText);
    if (currElec && actuation.history.length) {
      setAlert(true);
    } else {
      setPin(tempPin);
    }
  };
  useMap(() => {
    setPin(null);
  }, pin);

  return (
    <>
      <Dialog
        open={alert}
        onClose={() => { setAlert(false); }}
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
          <Button onClick={() => { setAlert(false); }} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setAlert(false);
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
          range(169, 175).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(176, 182).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(183, 189).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(190, 196).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
      </div>
      <div className="row">
        {
          range(168, 137).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(41, 64).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
        {
          range(129, 136).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(40, 9).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => clicked(e)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
