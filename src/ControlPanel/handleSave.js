import genFileContents from './genFileContents';

export default function handleSave(electrodes, allCombined, pinActuate, pinToElec, elecToPin, db) {
  db.transaction('rw', db.formData, async () => {
    if (electrodes && allCombined) {
      const newContents = genFileContents(electrodes, allCombined, pinActuate);

      db.formData.put({ id: 'squares', value: newContents.squares });
      db.formData.put({ id: 'combine', value: newContents.combs });
    }

    if (pinActuate && pinActuate.size !== 0) {
      db.formData.put({ id: 'actuation', value: [JSON.stringify([...pinActuate])] });

      const contents = [];
      pinActuate.forEach((value) => {
        contents.push(Array.from(value.content));
      });
      db.formData.put({ id: 'contents', value: contents });
    }

    if (pinToElec) {
      db.formData.put({ id: 'pinToElec', value: [JSON.stringify(pinToElec)] });
    }
    if (elecToPin) {
      db.formData.put({ id: 'elecToPin', value: [JSON.stringify(elecToPin)] });
    }
  }).catch((e) => console.log(e.stack || e));
}
