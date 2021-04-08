import React, { useContext } from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { genFileContents } from './genFileContents';

export function handleSave(electrodes, allCombined, db) {
  // console.log(db)
  const newContents = genFileContents(electrodes, allCombined);
  db.formData.put({ id: 'squares', value: newContents.squares });
  db.formData.put({ id: 'combine', value: newContents.combs });
}

export default function SaveButton() {
  const context = useContext(CanvasContext);
  const { electrodes } = context.squares;
  const { db } = context.state;
  const { allCombined } = context.combined;
  // console.log(db)
  return (
    <button onClick={() => handleSave(electrodes, allCombined, db)}>Save</button>
  );
}
