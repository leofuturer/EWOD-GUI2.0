import genFileContents from './genFileContents';

export default function handleSave(electrodes, allCombined, pinToElec, elecToPin, db) {
  db.transaction('rw', db.formData, async () => {
    if (electrodes && allCombined && elecToPin) {
      const newContents = genFileContents(electrodes, allCombined, elecToPin);
      db.formData.put({ id: 'squares', value: newContents.squares });
      db.formData.put({ id: 'combine', value: newContents.combs });
    }

    if (pinToElec) {
      db.formData.put({ id: 'pinToElec', value: [JSON.stringify(pinToElec)] });
    }
    if (elecToPin) {
      db.formData.put({ id: 'elecToPin', value: [JSON.stringify(elecToPin)] });
    }
  }).catch((e) => console.log(e.stack || e));
}
