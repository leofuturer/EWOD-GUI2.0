/* eslint-disable react/destructuring-assignment */
import React, { useContext } from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import handleSave from './handleSave';

export default function SaveButton() {
  const context = useContext(CanvasContext);
  const actuation = useContext(ActuationContext);
  const { pinToElec, elecToPin } = useContext(GeneralContext);
  const { electrodes } = context.squares;
  const { db } = context.state;
  const { allCombined } = context.combined;
  const { pinActuate } = actuation.actuation;
  // console.log(db)
  return (
    <button type="button" onClick={() => handleSave(electrodes, allCombined, pinActuate, pinToElec, elecToPin, db)}>Save</button>
  );
}
