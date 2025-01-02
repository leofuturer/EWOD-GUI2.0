/* eslint-disable react/destructuring-assignment */
import React, { useContext } from 'react';
import { Tooltip, ListItem } from '@material-ui/core';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import handleSave from './handleSave';
import icons from '../Icons/icons';

export default function SaveButton() {
  const context = useContext(CanvasContext);
  const { pinToElec, elecToPin } = useContext(GeneralContext);
  const { electrodes } = context.squares;
  const { db } = context.state;
  const { allCombined } = context.combined;
  // console.log(db)
  return (
    <Tooltip title="Save">
      <ListItem
        button
        onClick={() => handleSave(electrodes, allCombined, pinToElec, elecToPin, db)}
      >
        <img src={icons.save.icon} alt="Save" />
      </ListItem>
    </Tooltip>
  );
}
