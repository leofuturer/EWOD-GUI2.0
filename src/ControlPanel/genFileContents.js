function encoding(arr) {
  const res = new Array(8).fill(0);
  arr.forEach((e) => {
    const index = Math.floor((e + 1) / 32);
    const offset = (e + 1) % 32;
    // eslint-disable-next-line no-bitwise
    res[index] |= (1 << (32 - offset));
  });
  return res.join();
}

export default function genFileContents(electrodes, allCombined, pinActuate) {
  const newContents = {}; const squares = []; const
    combs = [];
  const seq = [];

  if (allCombined !== null && allCombined !== undefined) {
    for (let i = 0; i < allCombined.length; i += 1) {
      const comb = allCombined[i];
      const boop = `combine ${comb[0]} ${comb[1]} ${comb[2]}`;
      combs.push(boop);
    }
  }

  if (electrodes !== null && electrodes !== undefined) {
    for (let j = 0; j < electrodes.initPositions.length; j += 1) {
      const x = electrodes.initPositions[j][0] + electrodes.deltas[j][0];
      const y = electrodes.initPositions[j][1] + electrodes.deltas[j][1];
      const boop = `square ${x} ${y}`;
      squares.push(boop);
    }
  }

  if (pinActuate !== null && pinActuate !== undefined) {
    pinActuate.forEach((value) => {
      if (value.type === 'simple') {
        let block = encoding(value.content);
        block = `${block};${value.duration.toString()}`;
        if (value.parent !== null) {
          block = `${block};${pinActuate.get(value.parent).repTime.toString()}`;
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
