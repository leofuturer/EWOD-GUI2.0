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
    setSelected, setCombSelected, setMoving,
  } = canvasContext;

  const { mode } = useContext(GeneralContext);

  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');

  const [relativeX, setRelativeX] = useState('0px');
  const [relativeY, setRelativeY] = useState('0px');

  const [showMenu, setShowMenu] = useState(false);

  const [menuContents, setMenuContents] = useState(null);

  const canModeNames = ['Unselect', 'Move', 'Cut', 'Copy', 'Paste', 'Delete', 'Combine', 'Separate'];
  const canModeFuncs = [
    contextUnselect, contextMove, contextCut, contextCopy, contextPaste, contextDelete,
    handleCombine, separate,
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
