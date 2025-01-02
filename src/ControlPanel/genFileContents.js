import { ELEC_SIZE } from '../constants';

export default function genFileContents(electrodes, allCombined, elecToPin) {
  const newContents = {}; const squares = []; const
    combs = [];
  if (allCombined) {
    for (let i = 0; i < allCombined.length; i += 1) {
      const comb = allCombined[i];
      let boop = `combine ${comb[0] / ELEC_SIZE} ${comb[1] / ELEC_SIZE} ${comb[2]}`;
      if (elecToPin[`C${comb[2]}`]) {
        boop = `${boop} ${elecToPin[`C${comb[2]}`]}`;
      }
      combs.push(boop);
    }
  }

  if (electrodes) {
    for (let j = 0; j < electrodes.length; j += 1) {
      const x = electrodes[j].initPositions[0] + electrodes[j].deltas[0];
      const y = electrodes[j].initPositions[1] + electrodes[j].deltas[1];
      let boop = `square ${x / ELEC_SIZE} ${y / ELEC_SIZE}`;
      if (elecToPin[`S${electrodes[j].ids}`]) {
        boop = `${boop} ${elecToPin[`S${electrodes[j].ids}`]}`;
      }
      squares.push(boop);
    }
  }

  newContents.squares = squares;
  newContents.combs = combs;
  return newContents;
}
