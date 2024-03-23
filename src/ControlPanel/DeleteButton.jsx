/* eslint-disable linebreak-style */
import React, { useContext, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { DialogContentText, ListItemButton } from '@mui/material';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import icons from '../Icons/icons';
import { setPin } from '../USBCommunication/USBCommunication';

export default function DeleteButton({ name }) {
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

    setElectrodes([]);
    setComboLayout([]);

    setPinToElec({});
    setElecToPin({});
    setPin([], 0, true);
    clearAll();
    setOpen(false);
  }
  return (
    <>
      <Tooltip title={name}>
        <ListItem>
          <ListItemButton button onClick={() => { setOpen(true); }} data-testid={name === 'Delete' && 'clear'}>
            <img src={name === 'Delete' ? icons.delete.icon : icons.create.icon} alt={name} />
          </ListItemButton>
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
    </>
  );
}
