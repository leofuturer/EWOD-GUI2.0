import React, {
  useEffect, useState, useCallback, useContext,
} from 'react';
import DraggableItem from './DraggableItem';
import DraggableComb from './DraggableComb';

import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';

import ContextMenu from './ContextMenu';
import {
  ELEC_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_REAL_HEIGHT, CANVAS_REAL_WIDTH,
} from '../constants';

// const chassis = require('./chassis-with-background.svg');

export default function Canvas() {
  const canvasContext = useContext(CanvasContext);
  const { electrodes, selected } = canvasContext.squares;
  const { mouseDown } = canvasContext.state;
  const { allCombined } = canvasContext.combined;
  const {
    setMouseDown, setElectrodes,
  } = canvasContext;

  const actuationContext = useContext(ActuationContext);
  const { currentStep, pinActuate } = actuationContext.actuation;
  const { actuatePin, pushHistory } = actuationContext;

  const {
    mode, currElec, elecToPin,
  } = useContext(GeneralContext);

  // sets mousedown status for selecting existing electrodes
  const handleMouseDown = useCallback((event) => {
    switch (event.which) {
      case 1: // left mouse button pressed
        setMouseDown(true);
        break;
      default: // you're weird
        break;
    }
  }, [setMouseDown]);

  const handleMouseUp = useCallback(() => {
    setMouseDown(false);
  }, [setMouseDown]);

  useEffect(() => {
    document.querySelector('.greenArea').addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.querySelector('.greenArea').removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  const handleMouseMove = useCallback((e) => { // creating new electrode
    if (mode === 'DRAW' && mouseDown) {
      let elecAtXY = false;

      // electrode curr pos = init + deltas[idx]
      // wanna see if curr XY = electrodes[idx] + deltas[idx]
      const { initPositions } = electrodes;
      const { deltas } = electrodes;
      const x = Math.floor(e.offsetX / ELEC_SIZE) * ELEC_SIZE;
      const y = Math.floor(e.offsetY / ELEC_SIZE) * ELEC_SIZE;

      for (let idx = 0; idx < deltas.length; idx += 1) {
        // if an electrode already exists at this position
        if (x === initPositions[idx][0] + deltas[idx][0]
          && y === initPositions[idx][1] + deltas[idx][1]) {
          elecAtXY = true;
          break;
        }
      }
      if (!elecAtXY) {
        for (let ind = 0; ind < allCombined.length; ind += 1) {
          if (allCombined[ind][0] === x && allCombined[ind][1] === y) {
            elecAtXY = true;
            break;
          }
        }
      }

      if (!elecAtXY) { // create new electrode
        setElectrodes({
          initPositions: initPositions.concat([[x, y]]),
          deltas: deltas.concat([[0, 0]]),
        });
      }
    }
  }, [mode, electrodes, mouseDown, setElectrodes, allCombined]);

  useEffect(() => { // mouseover eventlistener over whole canvas
    // when dragging over a space that doesn't have an existing electrode, create new one
    // and stick in electrodes arr
    document.querySelector('.greenArea').addEventListener('mousemove', handleMouseMove);
    return () => {
      document.querySelector('.greenArea').removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  /* ########################### ACTUATION START ########################### */
  function handleClick(ind) {
    if (mode === 'SEQ') {
      if (pinActuate.get(currentStep).content.has(ind)) {
        pushHistory({
          type: 'actuate', pin: ind, id: currentStep, act: false,
        });
      } else {
        pushHistory({
          type: 'actuate', pin: ind, id: currentStep, act: true,
        });
      }
      actuatePin(ind);
      console.log(`Actuate ${ind} electrode`);
    }
  }
  /* ########################### ACTUATION END ########################### */
  /* ########################### HELPERS START ########################### */
  function isArrayInArray(arr, item) {
    const itemAsString = JSON.stringify(item);

    const contains = arr.some((ele) => JSON.stringify(ele) === itemAsString);
    return contains;
  }
  /* ########################### HELPERS END ########################### */
  /* ########################### COMBINE STUFF START ########################### */
  // strings representing allCombined electrodes
  const [finalCombines, setFinalCombines] = useState([]);

  // render combines
  useEffect(() => {
    allCombined.sort((a, b) => { // by row then column
      if (a[1] === b[1]) return a[0] - b[0];
      return a[1] - b[1];
    });
    const byX = {};
    for (let j = 0; j < allCombined.length; j += 1) {
      const x = allCombined[j][0];
      const yAndLayVal = [allCombined[j][1], allCombined[j][2]];
      if (Object.prototype.hasOwnProperty.call(byX, x)) byX[x].push(yAndLayVal);
      else byX[x] = [yAndLayVal];
    }
    // just strs representing points
    const combines = {};

    // inspiration from old EWOD-GUI
    for (let i = 0; i < allCombined.length; i += 1) {
      const x = allCombined[i][0];
      const x2 = x + ELEC_SIZE;
      const y = allCombined[i][1];
      const y2 = y + ELEC_SIZE;
      let pathstring = '';
      const layVal = allCombined[i][2];

      // has electrode on right side
      if (i + 1 < allCombined.length
        && allCombined[i + 1][0] === x2
        && allCombined[i + 1][2] === layVal) {
        if (isArrayInArray(byX[x], [y2, layVal])) {
          if (isArrayInArray(byX[x2], [y2, layVal])) { // has electrode on three sides
            pathstring = `M${x} ${y} L${x} ${y2} L${x2} ${y2} L${x2} ${y} Z `;
          } else { // has electrode on right and bottom side only
            pathstring = `M${x} ${y} L${x} ${y2 - 5} L${x2} ${y2 - 5} L${x2} ${y} Z `;
            pathstring += `M${x} ${y2 - 5} L${x} ${y2} L${x2 - 5} ${y2} L${x2 - 5} ${y2 - 5} Z `;
          }
        } else { // has electrode on right only
          pathstring = `M${x} ${y} L${x} ${y2 - 5} L${x2} ${y2 - 5} L${x2} ${y} Z `;
        }
      } else if (isArrayInArray(byX[x], [y2, layVal])) { // has electrode on down only
        pathstring = `M${x} ${y} L${x} ${y2} L${x2 - 5} ${y2} L${x2 - 5} ${y} Z `;
      } else { // has no electrode on either down or right
        pathstring = `M${x} ${y} L${x} ${y2 - 5} L${x2 - 5} ${y2 - 5} L${x2 - 5} ${y} Z `;
      }

      if (!Object.prototype.hasOwnProperty.call(combines, layVal)) {
        combines[layVal] = [pathstring, x, y];
      } else {
        combines[layVal][0] += pathstring;
        if (x > combines[layVal][1] || y < combines[layVal][2]) {
          combines[layVal][1] = x;
          combines[layVal][2] = y;
        }
      }
    }
    setFinalCombines(combines);
  }, [allCombined]);

  /* ########################### COMBINE STUFF END ########################### */

  return (
    <div className="wrapper" style={{ height: CANVAS_REAL_HEIGHT, width: CANVAS_REAL_WIDTH }}>
      <svg className="greenArea" xmlns="http://www.w3.org/2000/svg" style={{ width: CANVAS_WIDTH * ELEC_SIZE, height: CANVAS_HEIGHT * ELEC_SIZE }}>
        {electrodes.initPositions.map((startPos, ind) => (
          <DraggableItem key={ind.id} id={ind}>
            <rect
              data-testid="square"
              x={startPos[0]}
              y={startPos[1]}
              width={ELEC_SIZE - 5}
              height={ELEC_SIZE - 5}
              className={`electrode 
                            ${mode === 'SEQ' && pinActuate.has(currentStep)
                            && Object.prototype.hasOwnProperty.call(elecToPin, `S${ind}`) && pinActuate.get(currentStep).content.has(elecToPin[`S${ind}`]) ? 'toSeq' : ''}
                            ${mode === 'CAN' && selected.includes(ind) ? 'selected' : ''}
                            ${mode === 'PIN' && currElec === `S${ind}` ? 'toPin' : ''}`}
              onClick={() => {
                if (mode === 'SEQ') {
                  if (Object.prototype.hasOwnProperty.call(elecToPin, `S${ind}`)) {
                    handleClick(elecToPin[`S${ind}`]);
                  } else {
                    window.alert('no pin number for this electrode');
                  }
                } else {
                  handleClick(ind);
                }
              }}
            />
            {mode === 'PIN' && Object.prototype.hasOwnProperty.call(elecToPin, `S${ind}`)
              && (
                <text
                  x={`${startPos[0] + 5}`}
                  y={`${startPos[1] + ELEC_SIZE / 2}`}
                  width={ELEC_SIZE - 5}
                  height={ELEC_SIZE - 5}
                  fill="white"
                >
                  {elecToPin[`S${ind}`]}
                </text>
              )}
          </DraggableItem>
        ))}
        {Object.entries(finalCombines).map((comb, ind) => (
          <DraggableComb key={ind.id} id={parseInt(comb[0], 10)}>
            <path
              d={comb[1][0]}
              className={`electrode
                            ${mode === 'SEQ' && pinActuate.has(currentStep)
                            && Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`) && pinActuate.get(currentStep).content.has(elecToPin[`C${comb[0]}`]) ? 'toSeq' : ''}
                            ${mode === 'PIN' && currElec === `C${comb[0]}` ? 'toPin' : ''}`}
              data-testid="combined"
              onClick={() => {
                if (mode === 'SEQ') {
                  if (Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`)) {
                    handleClick(elecToPin[`C${comb[0]}`]);
                  } else {
                    window.alert('no pin number for this electrode');
                  }
                } else {
                  handleClick(ind);
                }
              }}
            />
            {mode === 'PIN' && Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`)
              && (
                <text
                  x={`${comb[1][1] + 5}`}
                  y={`${comb[1][2] + ELEC_SIZE / 2}`}
                  width={ELEC_SIZE - 5}
                  height={ELEC_SIZE - 5}
                  fill="white"
                >
                  {elecToPin[`C${comb[0]}`]}
                </text>
              )}
          </DraggableComb>
        ))}
      </svg>
      <ContextMenu />
    </div>
  );
}
