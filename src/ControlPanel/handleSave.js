import genFileContents from './genFileContents';

export default function handleSave(electrodes, allCombined, pinActuate, db) {
  // console.log(db)
  const newContents = genFileContents(electrodes, allCombined, pinActuate);
  db.formData.put({ id: 'squares', value: newContents.squares });
  db.formData.put({ id: 'combine', value: newContents.combs });
  db.formData.put({ id: 'actuation', value: newContents.actuation });
}
