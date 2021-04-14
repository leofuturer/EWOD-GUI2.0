export default function genFileContents(electrodes, allCombined) {
  const newContents = {}; const squares = []; const
    combs = [];

  for (let i = 0; i < allCombined.length; i += 1) {
    const comb = allCombined[i];
    const boop = `combine ${comb[0]} ${comb[1]} ${comb[2]}`;
    combs.push(boop);
  }

  for (let j = 0; j < electrodes.initPositions.length; j += 1) {
    const x = electrodes.initPositions[j][0] + electrodes.deltas[j][0];
    const y = electrodes.initPositions[j][1] + electrodes.deltas[j][1];
    const boop = `square ${x} ${y}`;
    squares.push(boop);
  }
  newContents.squares = squares;
  newContents.combs = combs;
  return newContents;
}
