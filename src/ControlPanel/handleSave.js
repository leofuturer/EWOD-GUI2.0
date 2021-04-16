import genFileContents from './genFileContents';

export default function handleSave(electrodes, allCombined, db) {
  // console.log(db)
  const newContents = genFileContents(electrodes, allCombined);
  db.formData.put({ id: 'squares', value: newContents.squares });
  db.formData.put({ id: 'combine', value: newContents.combs });
}
