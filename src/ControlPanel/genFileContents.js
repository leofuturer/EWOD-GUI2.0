export default function genFileContents(electrodes, allCombined, pinActuate, elecToPin) {
  const newContents = {}; const squares = []; const
    combs = [];
  const seq = [];

  if (allCombined) {
    for (let i = 0; i < allCombined.length; i += 1) {
      const comb = allCombined[i];
      let boop = `combine ${comb[0]} ${comb[1]} ${comb[2]}`;
      if (elecToPin[`C${comb[2]}`]) {
        boop = `${boop} ${elecToPin[`C${comb[2]}`]}`;
      }
      combs.push(boop);
    }
  }

  if (electrodes) {
    for (let j = 0; j < electrodes.initPositions.length; j += 1) {
      const x = electrodes.initPositions[j][0] + electrodes.deltas[j][0];
      const y = electrodes.initPositions[j][1] + electrodes.deltas[j][1];
      let boop = `square ${x} ${y}`;
      if (elecToPin[`S${electrodes.ids[j]}`]) {
        boop = `${boop} ${elecToPin[`S${electrodes.ids[j]}`]}`;
      }
      squares.push(boop);
    }
  }

  if (pinActuate) {
    pinActuate.forEach((value) => {
      if (value.type === 'simple') {
        let block = '';
        value.content.forEach((e) => {
          block = `${block + e.toString()},`;
        });
        block = block.slice(0, -1);
        block = `${value.id}:${block}:${value.duration.toString()}:${value.order}`;
        if (value.parent) {
          block = `${block};${value.parent}:${pinActuate.get(value.parent).repTime.toString()}`;
        }
        seq.push(block);
      }
    });
  }

  newContents.squares = squares;
  newContents.combs = combs;
  newContents.actuation = seq;
  return newContents;
}
