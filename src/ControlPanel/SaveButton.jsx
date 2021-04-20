/* eslint-disable react/destructuring-assignment */
import React, { useContext } from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';
import handleSave from './handleSave';

export default function SaveButton() {
  const context = useContext(CanvasContext);
  const { electrodes } = context.squares;
  const { db } = context.state;
  const { allCombined } = context.combined;
  // console.log(db)
  return (
    <button type="button" onClick={() => handleSave(electrodes, allCombined, db)}>Save</button>
  );
}
