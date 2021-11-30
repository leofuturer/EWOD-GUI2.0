import React, {
  useEffect, useState, useCallback, useContext,
} from 'react';
// eslint-disable-next-line import/no-unresolved
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import SVGContainer from 'react-svg-drag-and-select';
import { useHotkeys } from 'react-hotkeys-hook';

import DraggableItem from './DraggableItem';
import DraggableComb from './DraggableComb';

import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';

import ContextMenu from './ContextMenu';
import {
  ELEC_SIZE, CANVAS_REAL_HEIGHT, CANVAS_REAL_WIDTH,
  CANVAS_TRUE_HEIGHT, CANVAS_TRUE_WIDTH,
  CANVAS_RIGHT_EDGE, CANVAS_LEFT_EDGE, CANVAS_TOP_EDGE, CANVAS_BOTTOM_EDGE,
} from '../constants';

// hotkey library
// const chassis = require('./chassis-with-background.svg');

export default function Canvas() {
  const canvasContext = useContext(CanvasContext);
  const { electrodes, selected } = canvasContext.squares;
  const { mouseDown, moving } = canvasContext.state;
  const { allCombined } = canvasContext.combined;
  const combSelected = canvasContext.combined.selected;
  const {
    setMouseDown, setElectrodes, setSelected, setCombSelected, setComboLayout,
  } = canvasContext;

  const actuationContext = useContext(ActuationContext);
  const { currentStep, pinActuate } = actuationContext.actuation;
  const { actuatePin, pushHistory } = actuationContext;

  const {
    mode, currElec, elecToPin, setCurrElec, panning, setScaleXY, scaleXY, setPanning,
  } = useContext(GeneralContext);

  const [middleDown, setMiddleDown] = useState(false);
  const [shiftDown, setShiftDown] = useState(false);

  const [clipboard, setClipboard] = useState([]);
  const [relativeX, setRelativeX] = useState('0px');
  const [relativeY, setRelativeY] = useState('0px');

  const startShift = useCallback((event) => {
    if (event.keyCode === 16) setShiftDown(true);
  });

  const endShift = useCallback((event) => {
    if (event.keyCode === 16) setShiftDown(false);
  });

  useEffect(() => {
    document.addEventListener('keydown', startShift);
    document.addEventListener('keyup', endShift);
    return () => {
      document.removeEventListener('keydown', startShift);
      document.removeEventListener('keyup', endShift);
    };
  }, [startShift]);

  // sets mousedown status for selecting existing electrodes
  const handleMouseDown = useCallback((event) => {
    switch (event.which) {
      case 1: // left mouse button pressed
        setMouseDown(true);
        break;
      case 2: // middle mouse button pressed
        setMiddleDown(true);
        setPanning(true);
        break;
      default: // you're weird
        break;
    }
    setRelativeX(`${event.offsetX}px`);
    setRelativeY(`${event.offsetY}px`);
  }, [setMouseDown]);

  const handleMouseUp = useCallback(() => {
    setMouseDown(false);
    if (middleDown) {
      setPanning(false);
      setMiddleDown(false);
    }
  }, [setMouseDown, middleDown]);

  useEffect(() => {
    document.querySelector('.greenArea').addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.querySelector('.greenArea').removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  const handleMouseMove = useCallback((e) => { // creating new electrode
    if (mode === 'DRAW' && mouseDown && !panning) {
      let elecAtXY = false;

      // electrode curr pos = init + deltas[idx]
      // wanna see if curr XY = electrodes[idx] + deltas[idx]
      const { initPositions, deltas, ids } = electrodes;
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
        let newLastFreeInd = 0;
        if (electrodes.initPositions.length) {
          const availIDs = [...Array(Math.max(...electrodes.ids) + 2).keys()];
          newLastFreeInd = availIDs.find((id) => !electrodes.ids.includes(id));
        }
        setElectrodes({
          initPositions: initPositions.concat([[x, y]]),
          deltas: deltas.concat([[0, 0]]),
          ids: ids.concat(newLastFreeInd),
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
  function handleActuationMapping(ind) {
    if (mode === 'SEQ') {
      if (ind === 'REF') {
        window.alert('cannot actuate REF electrode');
        return;
      }
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

  function panningStop(ref) {
    let newX = ref.state.positionX;
    let newY = ref.state.positionY;
    if (newX < CANVAS_RIGHT_EDGE * ref.state.scale) {
      newX = CANVAS_RIGHT_EDGE * ref.state.scale;
    } else if (newX > CANVAS_LEFT_EDGE) newX = CANVAS_LEFT_EDGE;

    if (newY > CANVAS_TOP_EDGE) newY = CANVAS_TOP_EDGE;
    else if (newY < CANVAS_BOTTOM_EDGE * ref.state.scale) {
      newY = CANVAS_BOTTOM_EDGE * ref.state.scale;
    }

    ref.setTransform(newX, newY, ref.state.scale, 200, 'easeOut');
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

  function processSelected(sIds, cIds) {
    // if sId already in selected, then erase from concatenation and so on
    const setOfSelected = new Set(selected);
    const setOfCombSelected = new Set(combSelected);
    const mushedSquares = new Set(selected.concat(sIds));
    const mushedCombines = new Set(combSelected.concat(cIds));
    sIds.forEach((sId) => {
      if (setOfSelected.has(sId)) mushedSquares.delete(sId);
    });
    cIds.forEach((cId) => {
      if (setOfCombSelected.has(cId)) mushedCombines.delete(cId);
    });
    return [Array.from(mushedSquares), Array.from(mushedCombines)];
  }
  const [selectables, setSelectables] = useState([]);
  useEffect(() => {
    const { deltas, ids } = electrodes;
    const newSelectables = [];
    electrodes.initPositions.forEach((startPos, ind) => {
      const id = ids[ind];
      newSelectables.push({
        id: `S${id}`,
        tagName: 'rect',
        'data-testid': 'square',
        className: `electrode
          ${mode === 'SEQ' && pinActuate.has(currentStep)
          && Object.prototype.hasOwnProperty.call(elecToPin, `S${id}`)
          && pinActuate.get(currentStep).content.has(elecToPin[`S${id}`]) ? 'toSeq' : ''}
          ${mode === 'CAN' && selected.includes(`${id}`) ? 'selected' : ''}
          ${mode === 'PIN' && (currElec === `S${id}` || selected.includes(`${id}`)) ? 'toPin' : ''}`,
        x: startPos[0] + deltas[ind][0],
        y: startPos[1] + deltas[ind][1],
        width: ELEC_SIZE - 5,
        height: ELEC_SIZE - 5,
      });
      // text elems for pin number mapped to square
      if (Object.prototype.hasOwnProperty.call(elecToPin, `S${id}`)) {
        newSelectables.push({
          id: `TS${id}`,
          tagName: 'text',
          style: { transform: `translate(${deltas[ind][0]}px, ${deltas[ind][1]}px)` },
          x: startPos[0] + 2,
          y: startPos[1] + ELEC_SIZE / 2,
          width: ELEC_SIZE - 5,
          height: ELEC_SIZE - 5,
          fill: 'white',
          children: elecToPin[`S${id}`],
        });
      }
    });
    Object.entries(finalCombines).forEach((comb) => {
      newSelectables.push({
        id: `C${comb[0]}`,
        tagName: 'path',
        'data-testid': 'combined',
        d: comb[1][0],
        className: `electrode
          ${mode === 'SEQ' && pinActuate.has(currentStep)
          && Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`)
          && pinActuate.get(currentStep).content.has(elecToPin[`C${comb[0]}`]) ? 'toSeq' : ''}
          ${mode === 'CAN' && combSelected.includes(`${comb[0]}`) ? 'selected' : ''}
          ${mode === 'PIN' && (currElec === `C${comb[0]}` || combSelected.includes(`${comb[0]}`)) ? 'toPin' : ''}`,
        scale: scaleXY.scale,
        svgx: scaleXY.svgX,
        svgy: scaleXY.svgY,
      });
      // text elems for pin number mapped to square
      if (Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`)) {
        newSelectables.push({
          id: `TC${comb[0]}`,
          tagName: 'text',
          x: comb[1][1] + 2,
          y: comb[1][2] + ELEC_SIZE / 2,
          width: ELEC_SIZE - 5,
          height: ELEC_SIZE - 5,
          fill: 'white',
          children: elecToPin[`C${comb[0]}`],
        });
      }
    });

    setSelectables(newSelectables);
  }, [mode, moving, finalCombines, electrodes.initPositions, electrodes.deltas,
    elecToPin, selected, combSelected, actuatePin, scaleXY, setScaleXY]);

  function onSelectChange(selectedElecs) {
    const sIds = []; // square ids
    const cIds = []; // combined ids
    selectedElecs.forEach((elec) => {
      if (elec.tagName === 'rect') sIds.push(elec.id.slice(1));
      else if (elec.tagName === 'path') cIds.push(elec.id.slice(1));
    });

    if (mode === 'PIN') {
      if (shiftDown) {
        const newSelected = processSelected(sIds, cIds);
        setSelected(newSelected[0]); // first off, set new selections
        setCombSelected(newSelected[1]);

        // then figure out if user's selecting one electrode to set pin next
        if (newSelected[0].length + newSelected[1].length === 1) { // if selected one
          if (selected.length + combSelected.length > 1) setCurrElec(null); // if deselecting
          else if (newSelected[0].length) setCurrElec(`S${sIds[0]}`); // if selected square
          else setCurrElec(`C${cIds[0]}`); // if selected combined
        }
      } else { // not holding 'shift' down
        if (selectedElecs.length === 1) {
          if (sIds.length) setCurrElec(`S${sIds[0]}`); // if selected square
          else setCurrElec(`C${cIds[0]}`); // if selected combined
        } else { // selected multiple electrodes so has nothing to do with assigning pins
          setCurrElec(null);
        }
        setSelected(sIds);
        setCombSelected(cIds);
      }
    } else if (mode !== 'DRAW') {
      if (shiftDown) {
        const newSelected = processSelected(sIds, cIds);
        setSelected(newSelected[0]);
        setCombSelected(newSelected[1]);
      } else {
        setSelected(sIds);
        setCombSelected(cIds);
      }
    }

    // handle actuation
    if (selectedElecs.length === 1) {
      if (mode === 'SEQ') {
        if (sIds.length && Object.prototype.hasOwnProperty.call(elecToPin, `S${sIds[0]}`)) {
          handleActuationMapping(elecToPin[`S${sIds[0]}`]);
        } else if (cIds.length && Object.prototype.hasOwnProperty.call(elecToPin, `C${cIds[0]}`)) {
          handleActuationMapping(elecToPin[`C${cIds[0]}`]);
        } else {
          window.alert('no pin number for this electrode');
        }
      } else {
        handleActuationMapping(sIds[0]);
      }
    }
  }

  const [menuClick, setMenuClick] = useState(0);
  // val doesn't matter -- just need to toggle state to trigger rerender of SVGContainer

  /* ########################### COMBINE STUFF END ########################### */

  /* ########################### CLIPBOARD STUFF ########################### */

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

  function paste(relX, relY) {
    if (selected.length > 0) setSelected([]);
    if (combSelected.length > 0) setCombSelected([]);
    if (!clipboard.squares && !clipboard.combined) return;
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

  // keyboard shortcuts
  useHotkeys('ctrl+c', () => {
    copy();
  }, [selected, combSelected, clipboard, electrodes, allCombined]);

  useHotkeys('ctrl+v', () => {
    paste(relativeX, relativeY);
  }, [selected, combSelected, clipboard, electrodes, allCombined, relativeX, relativeY]);

  return (
    <div
      className="wrapper"
      style={{
        height: CANVAS_REAL_HEIGHT,
        width: CANVAS_REAL_WIDTH,
        overflow: mode === 'PIN' ? 'hidden' : 'visible',
      }}
    >
      {
        mode === 'DRAW' || moving ? (
          <TransformWrapper
            minScale={0.51}
            limitToBounds={false}
            panning={{ disabled: !panning, excluded: ['react-transform-wrapper'] }}
            pinch={{ excluded: ['react-transform-wrapper'] }}
            doubleClick={{ excluded: ['react-transform-wrapper'] }}
            wheel={{ excluded: ['react-transform-wrapper'] }}
            onPanningStop={(ref) => {
              setScaleXY({
                scale: ref.state.scale,
                svgX: ref.state.positionX,
                svgY: ref.state.positionY,
              });
              panningStop(ref);
            }}
            velocityAnimation={{ disabled: true }}
          >
            <TransformComponent id="zoom_div">
              <svg
                className="greenArea"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: CANVAS_TRUE_WIDTH,
                  height: CANVAS_TRUE_HEIGHT,
                  backgroundColor: '#93D08C',
                  backgroundSize: `${ELEC_SIZE}px ${ELEC_SIZE}px`,
                  backgroundImage:
                    `linear-gradient(to right, grey 1px, transparent 1px),
                    linear-gradient(to bottom, grey 1px, transparent 1px)`,
                }}
              >
                {electrodes.initPositions.map((startPos, ind) => {
                  const idx = electrodes.ids[ind];
                  return (
                    <DraggableItem key={ind.id} ind={ind} scaleXY={scaleXY}>
                      <rect
                        id={`S${idx}`}
                        data-testid="square"
                        x={startPos[0]}
                        y={startPos[1]}
                        width={ELEC_SIZE - 5}
                        height={ELEC_SIZE - 5}
                        className={`electrode
                                      ${mode === 'SEQ' && pinActuate.has(currentStep)
                                      && Object.prototype.hasOwnProperty.call(elecToPin, `S${idx}`)
                                      && pinActuate.get(currentStep).content.has(elecToPin[`S${idx}`]) ? 'toSeq' : ''}
                                      ${mode === 'CAN' && selected.includes(`${idx}`) ? 'selected' : ''}
                                      ${mode === 'PIN' && currElec === `S${idx}` ? 'toPin' : ''}`}
                      />
                      {Object.prototype.hasOwnProperty.call(elecToPin, `S${idx}`)
                        ? (
                          <text
                            x={startPos[0] + 5}
                            y={startPos[1] + ELEC_SIZE / 2}
                            width={ELEC_SIZE - 5}
                            height={ELEC_SIZE - 5}
                            fill="white"
                          >
                            {elecToPin[`S${idx}`]}
                          </text>
                        ) : (
                          <></>
                        )}
                    </DraggableItem>
                  );
                })}
                {Object.entries(finalCombines).map((comb, ind) => (
                  <DraggableComb key={ind.id} id={comb[0]} scaleXY={scaleXY}>
                    <path
                      id={`C${comb[0]}`}
                      d={comb[1][0]}
                      className={`electrode
                                    ${mode === 'SEQ' && pinActuate.has(currentStep)
                                    && Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`)
                                    && pinActuate.get(currentStep).content.has(elecToPin[`C${comb[0]}`]) ? 'toSeq' : ''}
                                    ${mode === 'CAN' && combSelected.includes(`${ind}`) ? 'selected' : ''}
                                    ${mode === 'PIN' && currElec === `C${comb[0]}` ? 'toPin' : ''}`}
                      data-testid="combined"
                    />
                    {Object.prototype.hasOwnProperty.call(elecToPin, `C${comb[0]}`)
                      && (
                        <text
                          x={comb[1][1] + 5}
                          y={comb[1][2] + ELEC_SIZE / 2}
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
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <TransformWrapper
            minScale={0.51}
            initialScale={mode === 'PIN' ? 0.51 : 1}
            limitToBounds={false}
            panning={{ disabled: !panning, excluded: ['react-transform-wrapper'] }}
            pinch={{ excluded: ['react-transform-wrapper'] }}
            doubleClick={{ excluded: ['react-transform-wrapper'] }}
            wheel={{ excluded: ['react-transform-wrapper'] }}
            onPanningStop={(ref) => {
              setScaleXY({
                scale: ref.state.scale,
                svgX: ref.state.positionX,
                svgY: ref.state.positionY,
              });
              panningStop(ref);
            }}
            velocityAnimation={{ disabled: true }}
            onZoom={(ref) => setScaleXY({
              scale: ref.state.scale,
              svgX: ref.state.positionX,
              svgY: ref.state.positionY,
            })}
          >
            <TransformComponent id="zoom_div">
              <SVGContainer
                menuClick={menuClick}
                mode={mode}
                scalexy={scaleXY}
                width={CANVAS_TRUE_WIDTH}
                height={CANVAS_TRUE_HEIGHT}
                onSelectChange={onSelectChange}
                items={selectables}
                isMovable={false}
                // eslint-disable-next-line react/jsx-boolean-value
                isSelectable={true}
                style={{
                  backgroundColor: '#93D08C',
                  backgroundSize: `${ELEC_SIZE}px ${ELEC_SIZE}px`,
                  backgroundImage: `linear-gradient(to right, grey 1px, transparent 1px),
                    linear-gradient(to bottom, grey 1px, transparent 1px)`,
                  width: CANVAS_TRUE_WIDTH,
                  height: CANVAS_TRUE_HEIGHT,
                }}
                className="greenArea"
              />
            </TransformComponent>
          </TransformWrapper>
        )
      }
      <ContextMenu setMenuClick={setMenuClick} />
    </div>
  );
}
