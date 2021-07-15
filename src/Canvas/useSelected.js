import React, { useEffect, useRef } from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import { CANVAS_TRUE_HEIGHT, CANVAS_TRUE_WIDTH } from '../constants';

export default function useSelected(callback, savingChanges) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const context = React.useContext(CanvasContext);
  const { bannerRef } = React.useContext(GeneralContext);
  const {
    setSelected, setElectrodes, setDelta, setComboLayout, setCombSelected,
  } = context;
  const { delta } = context.state;
  const { electrodes } = context.squares;
  const elecSelected = context.squares.selected;
  const { allCombined } = context.combined;
  const combSelected = context.combined.selected;
  const { deltas } = electrodes;

  function reset() {
    setDelta({ x: 0, y: 0 });
    setSelected([]);
    setCombSelected([]);
  }

  useEffect(() => {
    if (savingChanges) {
      // check no overlaps
      // want first pass through all existing positions + their ids and types
      // so if just drag to original position, won't consider them "overlaps"
      const positions = {};
      for (let sInd = 0; sInd < electrodes.initPositions.length; sInd += 1) {
        const init = electrodes.initPositions[sInd];
        const newDelX = deltas[sInd][0];
        const newDelY = deltas[sInd][1];
        const newX = newDelX + init[0];
        const newY = newDelY + init[1];
        const typeId = `s${sInd}`;
        if (Object.prototype.hasOwnProperty.call(positions, newX)) {
          positions[newX].push([newY, typeId]);
        } else {
          positions[newX] = [[newY, typeId]];
        }
      }

      allCombined.forEach((cPos) => {
        const typeId = `c${cPos[2]}`;
        if (Object.prototype.hasOwnProperty.call(positions, cPos[0])) {
          positions[cPos[0]].push([cPos[1], typeId]);
        } else {
          positions[cPos[0]] = [[cPos[1], typeId]];
        }
      });

      // go through selected and see if overlap with anything in positions
      const flag = elecSelected.some((selSqInd) => {
        const init = electrodes.initPositions[selSqInd];
        const newDelX = delta.x + deltas[selSqInd][0];
        const newDelY = delta.y + deltas[selSqInd][1];
        const newX = newDelX + init[0];
        const newY = newDelY + init[1];

        if (Object.prototype.hasOwnProperty.call(positions, newX)) {
          return positions[newX].some((yAndType) => {
            if (yAndType[0] === newY) {
              // check type to see if what we're overlapping on is selected
              if (yAndType[1][0] === 'c' && !combSelected.includes(parseInt(yAndType[1].substring(1), 10))) {
                bannerRef.current.getAlert('error', 'Overlapping on combined electrode!');
                return true;
              }
              if (yAndType[1][0] === 's' && !elecSelected.includes(parseInt(yAndType[1].substring(1), 10))) {
                bannerRef.current.getAlert('error', 'Overlapping on square electrode!');
                return true;
              }
            }
            return false;
          });
        }
        return false;
      });

      if (flag) {
        reset();
        return;
      }

      const eflag = combSelected.some((cInd) => {
        const selCs = allCombined.filter((x) => x[2] === cInd);
        return selCs.some((selC) => {
          const newX = selC[0] + delta.x;
          const newY = selC[1] + delta.y;
          if (Object.prototype.hasOwnProperty.call(positions, newX)) {
            return positions[newX].some((yAndType) => { // all the electrodes on column x
              if (yAndType[0] === newY) { // same y and not overlapping where you used to be
                const matchNum = parseInt(yAndType[1].substring(1), 10);
                if (yAndType[1][0] === 'c' && !combSelected.includes(matchNum)) {
                  bannerRef.current.getAlert('error', 'Overlapping on combined electrode!');
                  return true;
                } if (yAndType[1][0] === 's' && !elecSelected.includes(matchNum)) {
                  bannerRef.current.getAlert('error', 'Overlapping on square electrode!');
                  return true;
                }
              }
              return false;
            });
          }
          return false;
        });
      });

      if (eflag) {
        reset();
        return;
      }

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
            bannerRef.current.getAlert('error', 'Square electrode going off canvas!');
            reset();
            return;
          }
          copy[elecSelected[j]] = [newDelX, newDelY];
        }
        // don't want to setElectrodes here because
        // might have combined being dragged out of bounds in next for loop
        // in which case we wouldn't want to change our electrodes' current positions
      }

      // handle dragged combined
      let combines;
      if (combSelected.length > 0) {
        combSelected.sort((a, b) => a - b);

        for (let i = 0; i < combSelected.length; i += 1) {
          const layVal = parseInt(combSelected[i], 10);
          const selectedCombs = [];
          for (let k = 0; k < allCombined.length; k += 1) {
            if (allCombined[k][2] === layVal) {
              const newX = parseInt(allCombined[k][0], 10) + delta.x; const
                newY = parseInt(allCombined[k][1], 10) + delta.y;

              if (newX < 0 || newX >= CANVAS_TRUE_WIDTH || newY < 0 || newY >= CANVAS_TRUE_HEIGHT) {
                bannerRef.current.getAlert('error', 'Combined electrode going off canvas!');
                reset();
                return;
              }
              allCombined[k][0] = newX;
              allCombined[k][1] = newY;
              selectedCombs.push(allCombined[k]);
            }
          }
          combines = allCombined.filter((x) => x[2] !== layVal).concat(selectedCombs);
        }
        setComboLayout(combines);
        setCombSelected([]);
      }

      if (elecSelected.length > 0) {
        setElectrodes({ initPositions: electrodes.initPositions, deltas: copy });
        setSelected([]);
      }
      setDelta(null);

      savedCallback.current();
    }
  }, [savingChanges, allCombined, combSelected, delta,
    deltas, elecSelected, electrodes.initPositions, setCombSelected,
    setComboLayout, setDelta, setElectrodes, setSelected]);
}
