import React, { useContext, useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { DialogContentText } from '@material-ui/core';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import icons from '../Icons/icons';

export default function DeleteButton() {
  const context = useContext(CanvasContext);
  const actuation = useContext(ActuationContext);
  const {
    setSelected, setElectrodes, setCombSelected, setComboLayout,
  } = context;
  const { clearAll } = actuation;

  const { setPinToElec, setElecToPin } = useContext(GeneralContext);
  const [open, setOpen] = useState(false);

  function handleDelete() {
    setSelected([]);
    setCombSelected([]);

    setElectrodes({
      initPositions: [],
      deltas: [],
    });
    setComboLayout([]);

    setPinToElec({});
    setElecToPin({});

    clearAll();
    setOpen(false);
  }
  return (
    <div>
      <Tooltip title="Delete">
        <ListItem button onClick={() => { setOpen(true); }} data-testid="clear">
          <img src={icons.delete.icon} alt="Delete" />
        </ListItem>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => { setOpen(false); }}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">Reset the whole file?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            After clicking confirm, all work you made will be deleted permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); }} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="primary"
            autoFocus
            data-testid="delete-button"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
