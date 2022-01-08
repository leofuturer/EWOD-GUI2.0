import {
  useState, useContext,
} from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ELEC_SIZE } from '../constants';

export default function Shortcuts(situation) {
  const canvasContext = useContext(CanvasContext);
  const { electrodes, selected } = canvasContext.squares;
  const { allCombined } = canvasContext.combined;
  const combSelected = canvasContext.combined.selected;
  const {
    setElectrodes, setSelected, setComboLayout, setCombSelected,
  } = canvasContext;

  const [clipboard, setClipboard] = useState([]);

  function copy() {
    const squares = [];
    const combined = [];

    if (selected.length > 0) {
      const inits = electrodes.initPositions.filter((_, ind) => selected.includes(`${ind}`));
      const dels = electrodes.deltas.filter((_, ind) => selected.includes(`${ind}`));
      for (let i = 0; i < inits.length; i += 1) {
        const tmp = [inits[i][0] + dels[i][0], inits[i][1] + dels[i][1]];
        squares.push(tmp);
      }
      setSelected([]);
    }
    if (combSelected.length > 0) {
      // ex: selected IDs 2 4 7
      // want those to have some permutation of IDs 0 1 2 in clipboard
      const record = {};
      let ind = 0;
      allCombined.forEach((comb) => {
        if (combSelected.includes(`${comb[2]}`)) {
          if (Object.prototype.hasOwnProperty.call(record, comb[2])) {
            combined.push([comb[0], comb[1], record[comb[2]]]);
          } else {
            record[comb[2]] = ind;
            combined.push([comb[0], comb[1], ind]);
            ind += 1;
          }
        }
      });
      setCombSelected([]);
    }
    setClipboard({ squares, combined });
  }

  function paste(e, relX, relY) {
    if (selected.length > 0) setSelected([]);
    if (combSelected.length > 0) setCombSelected([]);
    const numSquaresCopied = clipboard.squares.length;
    const numCombinedCopied = clipboard.combined.length;
    if (numSquaresCopied > 0 || numCombinedCopied > 0) {
      const xInt = parseInt(relX, 10);
      const yInt = parseInt(relY, 10);
      const x = xInt - (xInt % ELEC_SIZE);
      const y = yInt - (yInt % ELEC_SIZE);
      if (numSquaresCopied > 0) {
        const newInits = [];
        for (let i = 0; i < numSquaresCopied; i += 1) newInits.push([x, y]);

        const newDels = [];
        const { squares } = clipboard;
        for (let j = 0; j < numSquaresCopied; j += 1) {
          newDels.push([squares[j][0] - squares[0][0], squares[j][1] - squares[0][1]]);
        }

        const maxID = Math.max(...electrodes.ids) + 1;
        const newIDs = [...new Array(numSquaresCopied).keys()].map((num) => num + maxID);
        setElectrodes({
          initPositions: electrodes.initPositions.concat(newInits),
          deltas: electrodes.deltas.concat(newDels),
          ids: electrodes.ids.concat(newIDs),
        });
      }
      if (numCombinedCopied > 0) {
        const { combined } = clipboard;
        const first = clipboard.squares.length > 0 ? clipboard.squares[0] : combined[0];
        const newCombs = [];
        const combIds = allCombined.map((el) => el[2]);
        const maxID = Math.max(...combIds);
        for (let k = 0; k < numCombinedCopied; k += 1) {
          newCombs.push([
            x + combined[k][0] - first[0],
            y + combined[k][1] - first[1],
            combined[k][2] + maxID + 1,
          ]);
        }
        setComboLayout(allCombined.concat(newCombs));
      }
    }
  }

  switch (situation) {
    case 'copy':
      copy();
      break;
    case 'paste':
      paste();
      break;
    default:
      console.log('That is not a function');
  }
}
