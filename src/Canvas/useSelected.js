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
      for (let sInd = 0; sInd < electrodes.length; sInd += 1) {
        const init = electrodes[sInd].initPositions;
        const newDelX = electrodes[sInd].deltas[0];
        const newDelY = electrodes[sInd].deltas[1];
        const newX = newDelX + init[0];
        const newY = newDelY + init[1];
        const typeId = `s${electrodes[sInd].ids}`;
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
      const flag = electrodes.some((element) => {
        if (elecSelected.includes(`${element.ids}`)) {
          const init = element.initPositions;
          const newDelX = delta.x + element.deltas[0];
          const newDelY = delta.y + element.deltas[1];
          const newX = newDelX + init[0];
          const newY = newDelY + init[1];

          if (Object.prototype.hasOwnProperty.call(positions, newX)) {
            return positions[newX].some((yAndType) => {
              if (yAndType[0] === newY) {
                // check type to see if what we're overlapping on is selected
                if (yAndType[1][0] === 'c' && !combSelected.includes(yAndType[1].substring(1))) {
                  bannerRef.current.getAlert('error', 'Overlapping on combined electrode!');
                  return true;
                }
                if (yAndType[1][0] === 's' && !elecSelected.includes(yAndType[1].substring(1))) {
                  bannerRef.current.getAlert('error', 'Overlapping on square electrode!');
                  return true;
                }
              }
              return false;
            });
          }
        }
        return false;
      });

      if (flag) {
        reset();
        return;
      }

      // go through selected combined electrodes and see if any overlap with anything not selected
      // go through all
      // rmb that allCombined is an arr where each elem is of the form [x, y, id]
      const setOfCombSelected = new Set(combSelected);
      const setOfSqSelected = new Set(elecSelected);
      const combinedOverlaps = allCombined.some((comb) => {
        if (setOfCombSelected.has(`${comb[2]}`)) { // this combined elec is selected
          // see if it overlaps anything unselected
          const newX = comb[0] + delta.x;
          const newY = comb[1] + delta.y;

          if (positions[newX]) { // look at elecs with same x coord
            return positions[newX].some((yAndType) => {
              if (yAndType[0] === newY) { // same x, y coord -- now just check if it's selected
                if (yAndType[1][0] === 'c') { // means overlapping on some combined elec
                  // if combined elec is selected tho, that means it's no longer at that position
                  // so not actually overlapping
                  if (setOfCombSelected.has(yAndType[1].substring(1))) return false;
                  bannerRef.current.getAlert('error', 'Overlapping on combined electrode!');
                  return true;
                }
                // else overlapping on some square elec
                if (setOfSqSelected.has(yAndType[1].substring(1))) return false;
                bannerRef.current.getAlert('error', 'Overlapping on square electrode!');
                return true;
              }
              return false;
            });
          }
        }
        return false;
      });

      if (combinedOverlaps) {
        reset();
        return;
      }

      // handle dragged singles
      let copy;
      if (elecSelected.length > 0) {
        copy = [...electrodes];

        for (let j = 0; j < electrodes.length; j += 1) {
          if (elecSelected.includes(`${electrodes[j].ids}`)) {
            const init = electrodes[j].initPositions;
            const newDelX = delta.x + electrodes[j].deltas[0];
            const newDelY = delta.y + electrodes[j].deltas[1];
            const newX = newDelX + init[0];
            const newY = newDelY + init[1];
            if (newX < 0 || newX >= CANVAS_TRUE_WIDTH || newY < 0 || newY >= CANVAS_TRUE_HEIGHT) {
              bannerRef.current.getAlert('error', 'Square electrode going off canvas!');
              reset();
              return;
            }
            copy[j].deltas = [newDelX, newDelY];
          }
        }
        // don't want to setElectrodes here because
        // might have combined being dragged out of bounds in next for loop
        // in which case we wouldn't want to change our electrodes' current positions
      }

      // handle dragged combined

      // new bool ensures that we only move electrodes in comb if
      // we know for sure the comb does not move off the screen.
      if (combSelected.length > 0) {
        const newCombines = [...allCombined];
        const allOnCanvas = newCombines.every((comb, ind) => {
          if (setOfCombSelected.has(`${comb[2]}`)) { // this elec was selected
            // so record its new position
            const newX = parseInt(comb[0], 10) + delta.x;
            const newY = parseInt(comb[1], 10) + delta.y;

            if (newX < 0 || newX >= CANVAS_TRUE_WIDTH || newY < 0 || newY >= CANVAS_TRUE_HEIGHT) {
              bannerRef.current.getAlert('error', 'Combined electrode going off canvas!');
              reset();
              return false;
            }
            newCombines[ind][0] = newX;
            newCombines[ind][1] = newY;
          }
          return true;
        });
        if (allOnCanvas) {
          setComboLayout(newCombines);
        }
        setCombSelected([]);
      }

      if (elecSelected.length > 0) {
        setElectrodes(copy);
        setSelected([]);
      }
      setDelta(null);

      savedCallback.current();
    }
  }, [savingChanges, allCombined, combSelected, delta, elecSelected, setCombSelected,
    setComboLayout, setDelta, setElectrodes, setSelected]);
}
