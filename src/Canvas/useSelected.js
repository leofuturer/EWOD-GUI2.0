import React from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { CANVAS_TRUE_HEIGHT, CANVAS_TRUE_WIDTH } from '../constants';

export default function useSelected(callback, savingChanges) {
  const savedCallback = React.useRef();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const context = React.useContext(CanvasContext);
  const {
    setSelected, setElectrodes, setDelta, setComboLayout, setCombSelected,
  } = context;
  const { delta } = context.state;
  const { electrodes } = context.squares;
  const elecSelected = context.squares.selected;
  const { allCombined } = context.combined;
  const combSelected = context.combined.selected;
  const { deltas } = electrodes;

  React.useEffect(() => {
    if (savingChanges) {
      // handle dragged singles
      let copy;
      if (elecSelected.length > 0) {
        copy = [...deltas];

        for (let j = 0; j < elecSelected.length; j += 1) {
          const init = electrodes.initPositions[elecSelected[j]];
          const newDelX = delta.x + deltas[elecSelected[j]][0];
          const newDelY = delta.y + deltas[elecSelected[j]][1];
          const newX = newDelX + init[0];
          const newY = newDelY + init[1];
          if (newX < 0 || newX >= CANVAS_TRUE_WIDTH || newY < 0 || newY >= CANVAS_TRUE_HEIGHT) {
            setSelected([]);
            setCombSelected([]);
            return;
          }
          copy[elecSelected[j]] = [newDelX, newDelY];
        }
        // don't want to setElectrodes here because
        // might have combined being dragged out of bounds in next for loop
        // in which case we wouldn't want to change our electrodes' current positions
        setSelected([]);
      }

      // handle dragged combined
      let combines;
      if (combSelected.length > 0) {
        combSelected.sort((a, b) => a - b);

        for (let i = 0; i < combSelected.length; i += 1) {
          const layVal = combSelected[i];
          const selectedCombs = [];
          for (let k = 0; k < allCombined.length; k += 1) {
            if (allCombined[k][2] === layVal) {
              const newX = parseInt(allCombined[k][0], 10) + delta.x; const
                newY = parseInt(allCombined[k][1], 10) + delta.y;
              // // TODO: disallow combined electrodes from being dragged over grid
              // if (newX < 0 || newX >= CANVAS_TRUE_WIDTH || newY < 0 || newY >= CANVAS_TRUE_HEIGHT) {
              //     setSelected([])
              //     setCombSelected([])
              //     return
              // }
              allCombined[k][0] = newX;
              allCombined[k][1] = newY;
              selectedCombs.push(allCombined[k]);
            }
          }
          combines = allCombined.filter((x) => x[2] !== layVal).concat(selectedCombs);
        }
        setCombSelected([]);
        setComboLayout(combines);
      }

      if (elecSelected.length > 0) {
        setElectrodes({ initPositions: electrodes.initPositions, deltas: copy });
      }
      setDelta(null);

      savedCallback.current();
    }
  }, [savingChanges, allCombined, combSelected, delta,
    deltas, elecSelected, electrodes.initPositions, setCombSelected,
    setComboLayout, setDelta, setElectrodes, setSelected]);
}
