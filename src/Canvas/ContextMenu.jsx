import React, {
  useState, useCallback, useEffect, useContext,
} from 'react';
import { Motion, spring } from 'react-motion';
import MenuItem from '@material-ui/core/MenuItem';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ELEC_SIZE } from '../constants';
import range from '../Pins/range';

export default function ContextMenu() {
  const canvasContext = useContext(CanvasContext);
  const { electrodes, selected } = canvasContext.squares;
  const { allCombined } = canvasContext.combined;
  const combSelected = canvasContext.combined.selected;
  const {
    setElectrodes, setSelected, setComboLayout, setCombSelected,
  } = canvasContext;
  const names = ['Cut', 'Copy', 'Paste', 'Delete', 'Combine'];
  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');

  const [relativeX, setRelativeX] = useState('0px');
  const [relativeY, setRelativeY] = useState('0px');

  const [showMenu, setShowMenu] = useState(false);

  const [clipboard, setClipboard] = useState([]);
  function contextCopy() {
    const squares = [];
    const combined = [];

    if (selected.length > 0) {
      const inits = electrodes.initPositions.filter((_, ind) => selected.includes(ind));
      const dels = electrodes.deltas.filter((_, ind) => selected.includes(ind));
      for (let i = 0; i < inits.length; i += 1) {
        const tmp = [inits[i][0] + dels[i][0], inits[i][1] + dels[i][1]];
        squares.push(tmp);
      }
      setSelected([]);
    }
    if (combSelected.length > 0) {
      let minLayval = Infinity;
      let maxLayval = -1;
      allCombined.forEach((comb) => {
        // eslint-disable-next-line prefer-destructuring
        if (combSelected.includes(comb[2]) && comb[2] < minLayval) minLayval = comb[2];
        // eslint-disable-next-line prefer-destructuring
        if (comb[2] > maxLayval) maxLayval = comb[2];
      });
      const gap = maxLayval + 1 - minLayval;
      allCombined.forEach((comb) => {
        if (combSelected.includes(comb[2])) combined.push([comb[0], comb[1], comb[2] + gap]);
      });
      setCombSelected([]);
    }
    setClipboard({ squares, combined });
  }

  function contextPaste() {
    if (selected.length > 0) setSelected([]);
    if (combSelected.length > 0) setCombSelected([]);
    const numSquaresCopied = clipboard.squares.length;
    const numCombinedCopied = clipboard.combined.length;
    if (numSquaresCopied > 0 || numCombinedCopied > 0) {
      const xInt = parseInt(relativeX, 10);
      const yInt = parseInt(relativeY, 10);
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

        setElectrodes({
          initPositions: electrodes.initPositions.concat(newInits),
          deltas: electrodes.deltas.concat(newDels),
        });
      }
      if (numCombinedCopied > 0) {
        const { combined } = clipboard;
        const first = clipboard.squares.length > 0 ? clipboard.squares[0] : combined[0];
        const newCombs = [];
        for (let k = 0; k < numCombinedCopied; k += 1) {
          newCombs.push([
            x + combined[k][0] - first[0],
            y + combined[k][1] - first[1],
            combined[k][2],
          ]);
        }
        setComboLayout(allCombined.concat(newCombs));
      }
      setClipboard({ squares: [], combined: [] });
    }
  }

  function squaresDelete() {
    const newPos = electrodes.initPositions.filter((val, ind) => !selected.includes(ind));
    const newDel = electrodes.deltas.filter((val, ind) => !selected.includes(ind));
    setSelected([]);
    setElectrodes({ initPositions: newPos, deltas: newDel });
  }

  function combinedDelete() {
    setComboLayout(allCombined.filter((combi) => !combSelected.includes(combi[2])));
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
    for (let j = 0; j < selected.length; j += 1) {
      const init = electrodes.initPositions[selected[j]];
      const del = electrodes.deltas[selected[j]];
      const x = init[0] + del[0];
      const y = init[1] + del[1];
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;

      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;

      positions.push([x, y, newLastFreeInd]);
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

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      setXPos(`${e.offsetX + rect.left}px`);
      setRelativeX(`${e.offsetX}px`);
      setRelativeY(`${e.offsetY}px`);
      if (e.offsetY > rect.bottom - 250) setYPos(`${e.offsetY + rect.top - 190}px`);
      else setYPos(`${e.offsetY + rect.top}px`);
      setShowMenu(true);
    },
    [setXPos, setYPos],
  );

  const handleClick = useCallback(() => {
    if (showMenu) setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.querySelector('.greenArea').addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('click', handleClick);
      document.querySelector('.greenArea').removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleClick, handleContextMenu]);

  const funcs = [contextCut, contextCopy, contextPaste, contextDelete, handleCombine];
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
              }}
            >
              <ul
                className="menu"
                style={{
                  zIndex: 5,
                  position: 'absolute',
                  top: yPos,
                  left: xPos,
                  backgroundColor: 'white',
                  padding: '10px 0px',
                  borderRadius: '5px',
                  boxShadow: '2px 2px 30px lightgrey',
                }}
              >
                {
                  names.map((name, idx) => (
                    <MenuItem
                      key={idx.id}
                      onClick={(e) => { funcs[idx](e, relativeX, relativeY); }}
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
