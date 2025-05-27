import React, {
  useState, useCallback, useEffect, useContext,
} from 'react';
import { Motion, spring } from 'react-motion';
import MenuItem from '@material-ui/core/MenuItem';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';

export default function ContextMenu({
  setMenuClick, contextCopy, contextPaste, contextMove,
  contextCut, contextDelete, contextUnselect, deleteSelectedMappings,
  separate, handleCombine,
}) {
  const canvasContext = useContext(CanvasContext);
  const {
    setSelected, setCombSelected, setMoving, moving,
  } = canvasContext;

  const { mode } = useContext(GeneralContext);

  // eslint-disable-next-line prefer-destructuring
  const clipboard = canvasContext.clipboard;

  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');

  const [relativeX, setRelativeX] = useState('0px');
  const [relativeY, setRelativeY] = useState('0px');

  const [showMenu, setShowMenu] = useState(false);

  const [menuContents, setMenuContents] = useState(null);

  const canModeNames = ['Move', 'Cut', 'Copy', 'Delete', 'Combine', 'Separate', 'Unselect'];
  const canModeFuncs = [
    contextMove, contextCut, contextCopy, contextDelete,
    handleCombine, separate, contextUnselect,
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
          if ((canvasContext.squares.selected.length || canvasContext.combined.selected.length)) {
            setMenuContents({
              names: canModeNames,
              funcs: canModeFuncs,
            });
          } else if ((clipboard.squares || clipboard.combined) && (clipboard.squares.length || clipboard.combined.length)) {
            setMenuContents({
              names: ['Paste'],
              funcs: [contextPaste],
            });
          } else {
            setMenuContents(null);
          }
          break;
        default:
          setMenuContents(null);
      }

      // Defensive: check if transform exists and has expected format
      let styleSplit = [];
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      try {
        const { transform } = e.currentTarget.childNodes[0].childNodes[0].style;
        if (transform) {
          styleSplit = transform.split(/[(,)]/);
          // Example: "matrix(a, b, c, d, tx, ty)"
          // For matrix, scale is a (styleSplit[1]), translateX is e (styleSplit[5]), translateY is f (styleSplit[6])
          // For translate/scale, adjust accordingly
          if (styleSplit[0].includes('matrix')) {
            scale = parseFloat(styleSplit[1]) || 1;
            translateX = parseFloat(styleSplit[5]) || 0;
            translateY = parseFloat(styleSplit[6]) || 0;
          } else if (styleSplit[0].includes('translate')) {
            translateX = parseFloat(styleSplit[1]) || 0;
            translateY = parseFloat(styleSplit[2]) || 0;
          } else if (styleSplit[0].includes('scale')) {
            scale = parseFloat(styleSplit[1]) || 1;
          }
        }
      } catch (err) {
        // fallback to defaults
        scale = 1;
        translateX = 0;
        translateY = 0;
      }

      let x = e.offsetX * scale + translateX;
      if (mode !== 'PIN') x += 49; // left bar width
      else x += 215;

      setXPos(`${x}px`);

      setRelativeX(`${e.offsetX}px`);
      setRelativeY(`${e.offsetY}px`);

      let y = e.offsetY * scale + translateY;
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
  }, [showMenu, setMoving, moving]);

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
