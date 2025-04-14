import genFileContents from './genFileContents';

export default async function handleSave(
  electrodes,
  allCombined,
  pinActuate,
  pinToElec,
  elecToPin,
  db,
  setProgress,
) {
  const totalSteps = 5; // Update based on actual steps
  let currentStep = 0;

  function updateProgress() {
    currentStep += 1;
    setProgress(Math.min((currentStep / totalSteps) * 100, 100));
  }

  try {
    await db?.transaction('rw', db.formData, async () => {
      if (electrodes && allCombined && elecToPin) {
        const newContents = genFileContents(electrodes, allCombined, pinActuate, elecToPin);
        await db.formData.put({ id: 'squares', value: newContents.squares });
        updateProgress();
        await db.formData.put({ id: 'combine', value: newContents.combs });
        updateProgress();
      }

      if (pinActuate && pinActuate.size !== 0) {
        await db.formData.put({ id: 'actuation', value: [JSON.stringify([...pinActuate])] });
        updateProgress();

        const contents = [];
        pinActuate.forEach((value) => {
          contents.push(Array.from(value.content));
        });
        await db.formData.put({ id: 'contents', value: contents });
        updateProgress();
      }

      if (pinToElec) {
        await db.formData.put({ id: 'pinToElec', value: [JSON.stringify(pinToElec)] });
        updateProgress();
      }
      if (elecToPin) {
        await db.formData.put({ id: 'elecToPin', value: [JSON.stringify(elecToPin)] });
        updateProgress();
      }
    });

    setProgress(100);
  } catch (error) {
    console.log(error.stack || error);
  }
}
