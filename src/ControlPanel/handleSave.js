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

  if (pinActuate !== null && pinActuate.size !== 0) {
    const map = [];
    map.push(JSON.stringify([...pinActuate]));
    db.formData.put({ id: 'actuation', value: [JSON.stringify([...pinActuate])] });

    const contents = [];
    pinActuate.forEach((value) => {
      const list = [];
      value.content.forEach((e) => list.push(e));
      contents.push(list);
    });
    db.formData.put({ id: 'contents', value: contents });
  }
}
