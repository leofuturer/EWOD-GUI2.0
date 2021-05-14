import genFileContents from './genFileContents';

export default function handleSave(electrodes, allCombined, pinActuate, pinToElec, elecToPin, db) {
  if (electrodes !== null && allCombined !== null) {
    const newContents = genFileContents(electrodes, allCombined, pinActuate);

    db.formData.put({ id: 'squares', value: newContents.squares });
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

  if (pinToElec !== null) {
    db.formData.put({ id: 'pinToElec', value: [JSON.stringify(pinToElec)] });
  }
  if (elecToPin !== null) {
    db.formData.put({ id: 'elecToPin', value: [JSON.stringify(elecToPin)] });
  }
}
