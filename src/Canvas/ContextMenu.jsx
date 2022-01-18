import React, {
  useState, useCallback, useEffect, useContext,
} from 'react';
import { Motion, spring } from 'react-motion';
import MenuItem from '@material-ui/core/MenuItem';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { ELEC_SIZE } from '../constants';
import range from '../Pins/range';

export default function ContextMenu({ setMenuClick }) {
  const canvasContext = useContext(CanvasContext);
  const { electrodes, selected } = canvasContext.squares;
  const { allCombined } = canvasContext.combined;
  const combSelected = canvasContext.combined.selected;
  const {
    setElectrodes, setSelected, setComboLayout, setCombSelected, setMoving,
  } = canvasContext;

  const {
    setPinToElec, setElecToPin, pinToElec, elecToPin, mode, currElec, setCurrElec,
  } = useContext(GeneralContext);

  const { actuation, setPinActuation } = useContext(ActuationContext);
  const { pinActuate } = actuation;

  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');

  const [relativeX, setRelativeX] = useState('0px');
  const [relativeY, setRelativeY] = useState('0px');

  const [showMenu, setShowMenu] = useState(false);

  const [clipboard, setClipboard] = useState([]);

  const [menuContents, setMenuContents] = useState(null);

  function contextMove() {
    if (selected.length || combSelected.length) setMoving(true);
  }

  function contextCopy() {
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

  function contextPaste(e, relX, relY) {
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
        const newDels = [];
        const { squares } = clipboard;
        for (let i = 0; i < numSquaresCopied; i += 1) {
          newInits.push([x, y]);
          newDels.push([squares[i][0] - squares[0][0], squares[i][1] - squares[0][1]]);
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

  function squaresDelete() {
    const mappedPins = [];
    // go through selected squares to erase any of their pin mappings
    electrodes.ids.forEach((id) => {
      if (selected.includes(`${id}`)) {
        const square = `S${id}`;
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
    const newPos = electrodes.initPositions
      .filter((val, ind) => !selected.includes(`${electrodes.ids[ind]}`));
    const newDel = electrodes.deltas.filter((val, ind) => !selected.includes(`${electrodes.ids[ind]}`));
    const newIds = electrodes.ids.filter((id) => !selected.includes(`${id}`));
    setSelected([]);
    setElectrodes({ initPositions: newPos, deltas: newDel, ids: newIds });
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

  function contextDelete() {
    combinedDelete();
    squaresDelete();
  }

  function contextCut() {
    contextCopy();
    contextDelete();
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
    for (let j = 0; j < electrodes.initPositions.length; j += 1) {
      if (selected.includes(`${electrodes.ids[j]}`)) {
        const init = electrodes.initPositions[j];
        const del = electrodes.deltas[j];
        const x = init[0] + del[0];
        const y = init[1] + del[1];
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;

        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;

        positions.push([x, y, newLastFreeInd]);
      }
    }
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
    const selectedCombCoords = [];
    selectedCombs.forEach((coord) => {
      selectedCombCoords.push([coord[0], coord[1]]);
    });
    const maxID = electrodes.ids.length ? Math.max(...electrodes.ids) + 1 : 0;
    const newIDs = [...new Array(selectedCombs.length).keys()].map((num) => num + maxID);
    setElectrodes({
      initPositions: electrodes.initPositions.concat(selectedCombCoords),
      deltas: electrodes.deltas
        .concat(new Array(allCombined.length).fill(null).map(() => new Array(2).fill(0))),
      ids: electrodes.ids.concat(newIDs),
    });
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

  const canModeNames = ['Move', 'Cut', 'Copy', 'Paste', 'Delete', 'Combine', 'Separate'];
  const canModeFuncs = [
    contextMove, contextCut, contextCopy, contextPaste, contextDelete, handleCombine, separate,
  ];

  const pinModeNames = ['Delete Selected Mappings'];
  const pinModeFuncs = [deleteSelectedMappings];

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      switch (mode) {
        case 'PIN':
          setMenuContents({
            names: pinModeNames,
            funcs: pinModeFuncs,
          });
          break;
        case 'CAN':
          setMenuContents({
            names: canModeNames,
            funcs: canModeFuncs,
          });
          break;
        default:
          setMenuContents(null);
      }

      const styleSplit = e.currentTarget.childNodes[0].childNodes[0].style.transform.split(/[(,)]/);
      const scale = parseFloat(styleSplit[5], 10);
      // if user opens context menu far right or far down the canvas,
      // have context menu's bottom left corner start at mouse
      // rather than having the context menu's top left corner start at mouse
      let x = e.offsetX * scale + parseFloat(styleSplit[1].slice(0, -2), 10);
      if (mode !== 'PIN') x += 49; // left bar width
      else x += 215;

      setXPos(`${x}px`);

      setRelativeX(`${e.offsetX}px`);
      setRelativeY(`${e.offsetY}px`);

      let y = e.offsetY * scale + parseFloat(styleSplit[2].slice(0, -2), 10);
      if (mode !== 'PIN') y += 75; // top bar height + menu padding
      else y += 280;

      setYPos(`${y}px`);
      setShowMenu(true);
    },
    [setXPos, setYPos, setSelected, setCombSelected],
  );

  const handleClick = useCallback(() => {
    if (showMenu) setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    if (mode === 'CAN' || mode === 'PIN') {
      document.querySelector('.wrapper').addEventListener('contextmenu', handleContextMenu);
    }
    return () => {
      if (mode === 'CAN' || mode === 'PIN') {
        document.querySelector('.wrapper').removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [mode, setMoving]);

  useEffect(() => {
    if (showMenu) {
      document.querySelector('.greenArea').addEventListener('click', handleClick);
    }
    return () => {
      if (!showMenu) {
        document.querySelector('.greenArea').removeEventListener('click', handleClick);
      }
    };
  }, [showMenu]);

  return (
    <Motion
      defaultStyle={{ opacity: 0 }}
      style={{ opacity: !showMenu ? spring(0) : spring(1) }}
    >
      {(interpolatedStyle) => (
        <>
          {showMenu && (
            <div
              className="menu-container"
              style={{
                opacity: interpolatedStyle.opacity,
                position: 'absolute',
                top: yPos,
                left: xPos,
              }}
            >
              <ul
                className="menu"
                style={{
                  zIndex: 5,
                  backgroundColor: 'white',
                  padding: '10px 0px',
                  borderRadius: '5px',
                  boxShadow: '2px 2px 30px lightgrey',
                }}
              >
                {
                  menuContents && menuContents.names.map((name, idx) => (
                    <MenuItem
                      key={idx.id}
                      onClick={(e) => {
                        menuContents.funcs[idx](e, relativeX, relativeY);
                        setMenuClick((menuclick) => (menuclick ? 0 : 1));
                        setShowMenu(false);
                      }}
                    >
                      {name}
                    </MenuItem>
                  ))
                }
              </ul>
            </div>
          )}
        </>
      )}
    </Motion>
  );
}
