import React, { useContext, useState } from 'react';
import { Tooltip, ListItem, CircularProgress } from '@material-ui/core';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import handleSave from './handleSave';
import icons from '../Icons/icons';

export default function SaveButton() {
  // Destructure context values properly
  const { squares, state, combined } = useContext(CanvasContext);
  const { actuation } = useContext(ActuationContext);
  const { pinToElec, elecToPin } = useContext(GeneralContext);

  const { electrodes } = squares;
  const { db } = state;
  const { allCombined } = combined;
  const { pinActuate } = actuation;

  // State for progress and saving status
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = async () => {
    setSaving(true);
    setProgress(0);
    await handleSave(electrodes, allCombined, pinActuate, pinToElec, elecToPin, db, setProgress);
    setSaving(false);
  };

  return (
    <Tooltip title="Save">
      <ListItem button onClick={handleClick} disabled={saving}>
        {saving ? <CircularProgress size={24} variant="determinate" value={progress} />
          : <img src={icons.save.icon} alt="Save" />}
      </ListItem>
    </Tooltip>
  );
}
