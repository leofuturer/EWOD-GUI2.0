import genFileContents from './genFileContents';

export default function handleSave(electrodes, allCombined, pinActuate, db) {
  // console.log(db)
  const newContents = genFileContents(electrodes, allCombined, pinActuate);
  if (newContents.squares.length !== 0) {
    db.formData.put({ id: 'squares', value: newContents.squares });
  }

  if (newContents.combs.length !== 0) {
    db.formData.put({ id: 'combine', value: newContents.combs });
  }

  if (newContents.actuation.length !== 0) {
    const map = [];
    map.push(JSON.stringify([...pinActuate]));
    db.formData.put({ id: 'actuation', value: [JSON.stringify([...pinActuate])] });
  }
}
