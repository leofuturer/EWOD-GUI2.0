import React, {
  useEffect, useState, useCallback, useContext,
} from 'react';
// eslint-disable-next-line import/no-unresolved
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import SVGContainer from 'react-svg-drag-and-select';

import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';

import ContextMenu from './ContextMenu';
import {
  ELEC_SIZE, CANVAS_REAL_HEIGHT, CANVAS_REAL_WIDTH,
  CANVAS_TRUE_HEIGHT, CANVAS_TRUE_WIDTH,
  CANVAS_RIGHT_EDGE, CANVAS_LEFT_EDGE, CANVAS_TOP_EDGE, CANVAS_BOTTOM_EDGE,
} from '../constants';
import range from '../Pins/range';
import './Canvas.css';

// hotkey library
// const chassis = require('./chassis-with-background.svg');

export default function Canvas() {
  const canvasContext = useContext(CanvasContext);
  const { electrodes, selected } = canvasContext.squares;
  const { moving } = canvasContext.state;
  const { allCombined } = canvasContext.combined;
  const combSelected = canvasContext.combined.selected;
  // eslint-disable-next-line prefer-destructuring
  const {
    // eslint-disable-next-line max-len
    setMouseDown, setElectrodes, setSelected, setCombSelected, setComboLayout, setMoving,
  } = canvasContext;

  const actuationContext = useContext(ActuationContext);
  const { currentStep, pinActuate } = actuationContext.actuation;
  const { actuatePin, pushHistory, setPinActuation } = actuationContext;

  const {
    mode, currElec, elecToPin, setCurrElec, panning, setScaleXY, scaleXY, setPanning,
    pinToElec, setPinToElec, setElecToPin,
  } = useContext(GeneralContext);

  const [middleDown, setMiddleDown] = useState(false);
  const [shiftDown, setShiftDown] = useState(false);

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
    const newSelectables = [];
    electrodes.forEach((element) => {
      const { ids, initPositions, deltas } = element;
      newSelectables.push({
        id: `S${ids}`,
        tagName: 'rect',
        'data-testid': 'square',
        className: `electrode
          ${mode === 'SEQ' && pinActuate.has(currentStep)
          && Object.prototype.hasOwnProperty.call(elecToPin, `S${ids}`)
          && pinActuate.get(currentStep).content.has(elecToPin[`S${ids}`]) ? 'toSeq' : ''}
          ${mode === 'CAN' && selected.includes(`${ids}`) ? 'selected' : ''}
          ${mode === 'PIN' && (currElec === `S${ids}` || selected.includes(`${ids}`)) ? 'toPin' : ''}`,
        x: initPositions[0] + deltas[0],
        y: initPositions[1] + deltas[1],
        width: ELEC_SIZE - 5,
        height: ELEC_SIZE - 5,
      });
      // text elems for pin number mapped to square
      if (Object.prototype.hasOwnProperty.call(elecToPin, `S${ids}`)) {
        newSelectables.push({
          id: `TS${ids}`,
          tagName: 'text',
          style: { transform: `translate(${deltas[0]}px, ${deltas[1]}px)` },
          x: initPositions[0] + 2,
          y: initPositions[1] + ELEC_SIZE / 2,
          width: ELEC_SIZE - 5,
          height: ELEC_SIZE - 5,
          fill: 'white',
          children: elecToPin[`S${ids}`],
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
  }, [mode, moving, finalCombines, electrodes, elecToPin, selected,
    combSelected, actuatePin, scaleXY, setScaleXY]);

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
    } else if (shiftDown) {
      const newSelected = processSelected(sIds, cIds);
      setSelected(newSelected[0]);
      setCombSelected(newSelected[1]);
    } else {
      setSelected(sIds);
      setCombSelected(cIds);
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

  function unselect() {
    if (selected.length || combSelected.length) {
      setMoving(false);
      setSelected([]);
      setCombSelected([]);
    }
  }

  function squaresDelete() {
    const mappedPins = [];
    // go through selected squares to erase any of their pin mappings
    electrodes.forEach((element) => {
      if (selected.includes(`${element.ids}`)) {
        const square = `S${element.ids}`;
        const mappedPin = elecToPin[square];
        if (mappedPin) { // mapping exists for this electrode so delete mapping
          mappedPins.push(mappedPin);
          delete pinToElec[mappedPin];
          delete elecToPin[square];
        }
      }
    });

    Array.from(pinActuate.keys()).forEach((key) => {
      const value = pinActuate.get(key);
      value.content.forEach((e) => {
        if (mappedPins.includes(e)) value.content.delete(e);
      });
    });

    setPinActuation(new Map(pinActuate));

    setPinToElec({ ...pinToElec });
    setElecToPin({ ...elecToPin });
    const newElectrodes = electrodes.filter((element) => !selected.includes(`${element.ids}`));
    setSelected([]);
    setElectrodes(newElectrodes);
  }

  function combinedDelete() {
    // go through selected combined elecs to erase any of their pin mappings
    combSelected.forEach((index) => {
      const combined = `C${index}`;
      const mappedPin = elecToPin[combined];
      if (mappedPin) { // mapping exists for this electrode so delete mapping
        delete pinToElec[mappedPin];
        delete elecToPin[combined];
      }
    });

    setPinToElec({ ...pinToElec });
    setElecToPin({ ...elecToPin });
    setComboLayout(allCombined.filter((combi) => !combSelected.includes(`${combi[2]}`)));
    setCombSelected([]);
  }

  function getCombinedLastFreeInd() {
    if (!allCombined.length) return 0;
    const layVals = new Set();
    allCombined.forEach((comb) => layVals.add(comb[2]));

    // probably don't actually need lowest last free index
    // but would be unfortunate if they keep combining and deleting
    // on the same design and if it kept picking the latest free index (allCombined.length)
    const availIDs = range(0, Math.max(...layVals) + 1);
    const newLastFreeInd = availIDs.find((layoutVal) => !layVals.has(layoutVal));
    return newLastFreeInd;
  }

  function handleCombine(e) {
    e.preventDefault();
    if (selected.length < 2) {
      window.alert('You need to combine at least 2 square electrodes.');
      return;
    }
    if (combSelected.length > 0) {
      window.alert("You can't combine already combined electrodes.");
      return;
    }

    const positions = [];
    // see if selected electrodes are adjacent to each other
    const layVals = new Set([]);
    for (let i = 0; i < allCombined.length; i += 1) layVals.add(allCombined[i][2]);

    const newLastFreeInd = getCombinedLastFreeInd();

    let xMin = Infinity;
    let xMax = -1;
    let yMin = Infinity;
    let yMax = -1;
    electrodes.forEach((element) => {
      if (selected.includes(`${element.ids}`)) {
        const init = element.initPositions;
        const del = element.deltas;
        const x = init[0] + del[0];
        const y = init[1] + del[1];
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;

        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;

        positions.push([x, y, newLastFreeInd]);
      }
    });
    /* CHECK NODES ARE ADJACENT BEFORE COMBINING */
    const numRows = (yMax - yMin) / ELEC_SIZE + 1;
    const numCols = (xMax - xMin) / ELEC_SIZE + 1;
    const adj = new Array(numRows).fill(0).map(() => new Array(numCols).fill(0));
    // want 2D grid from xMin to xMax, yMin to yMax
    // indexed 0 on both axes

    /*
            ex: y: 40-120, x: 80-160, startY = 1, startX = 2
            (y , x)
            (40, 80) ->  (1 - 1, 2 - 2) want (0, 0)
            (120, 160) -> (3 - 1, 4 - 2)
        */

    const startY = yMin / ELEC_SIZE;
    const startX = xMin / ELEC_SIZE;

    positions.forEach((pos) => {
      adj[(pos[1] / ELEC_SIZE) - startY][(pos[0] / ELEC_SIZE) - startX] = 1;
    });

    function connect(y, x) {
      if (y < 0 || y >= numRows || x < 0 || x >= numCols) return;
      if (adj[y][x] === 1) {
        adj[y][x] = 0;
        connect(y - 1, x);
        connect(y + 1, x);
        connect(y, x - 1);
        connect(y, x + 1);
      }
    }
    connect((positions[0][1] / ELEC_SIZE) - startY, (positions[0][0] / ELEC_SIZE) - startX);

    // if selected electrodes aren't adj, alert then return
    if (adj.some((row) => row.includes(1))) {
      window.alert("Selected electrodes to combine aren't adjacent");
      return;
    }

    setComboLayout(allCombined.concat(positions));
    squaresDelete();
  }

  function separate() {
    if (!combSelected.length || selected.length) {
      window.alert('Can only separate combined electrodes');
      return;
    }
    const selectedCombs = allCombined.filter((x) => combSelected.includes(`${x[2]}`));
    let maxID = electrodes.length === 0 ? 0 : electrodes[electrodes.length - 1].ids + 1;
    const tmps = [];
    selectedCombs.forEach((element) => {
      const tmp = {};
      tmp.initPositions = [element[0], element[1]];
      tmp.deltas = [0, 0];
      tmp.ids = maxID;
      maxID += 1;
      tmps.push(tmp);
    });
    setElectrodes(electrodes.concat(tmps));
    combinedDelete();
  }

  function deleteSelectedMappings() {
    if (selected.length || combSelected.length || currElec) {
      const etp = { ...elecToPin };
      const pte = { ...pinToElec };
      if (currElec) {
        if (etp[currElec]) {
          delete pte[etp[currElec]];
          delete etp[currElec];
        }
        setCurrElec(null);
      } else {
        if (selected.length) {
          selected.forEach((num) => {
            if (etp[`S${num}`]) {
              delete pte[etp[`S${num}`]];
              delete etp[`S${num}`];
            }
          });
        }
        if (combSelected.length) {
          combSelected.forEach((num) => {
            if (etp[`C${num}`]) {
              delete pte[etp[`C${num}`]];
              delete etp[`C${num}`];
            }
          });
        }
      }
      setElecToPin(etp);
      setPinToElec(pte);
    }
  }

  return (
    <div
      className="wrapper"
      style={{
        height: mode === 'SEQ' ? '600px' : CANVAS_REAL_HEIGHT,
        width: mode === 'SEQ' ? '1500px' : CANVAS_REAL_WIDTH,
        overflow: mode === 'SEQ' || mode === 'PIN' ? 'hidden' : 'visible',
      }}
    >
      (
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
            // eslint-disable-next-line react/jsx-no-bind
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
      <ContextMenu
        setMenuClick={setMenuClick}
        // eslint-disable-next-line react/jsx-no-bind
        contextUnselect={unselect}
        // eslint-disable-next-line react/jsx-no-bind
        separate={separate}
        // eslint-disable-next-line react/jsx-no-bind
        handleCombine={handleCombine}
        // eslint-disable-next-line react/jsx-no-bind
        deleteSelectedMappings={deleteSelectedMappings}
      />
    </div>
  );
}
