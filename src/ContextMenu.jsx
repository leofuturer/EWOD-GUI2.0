import React, { useState, useCallback, useEffect } from 'react';
import { Motion, spring } from 'react-motion';
import MenuItem from '@material-ui/core/MenuItem';

export function ContextMenu({ names, funcs }) {
  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');

  const [relativeX, setRelativeX] = useState('0px');
  const [relativeY, setRelativeY] = useState('0px');

  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();

      setXPos(`${e.offsetX + rect.left}px`);
      setYPos(`${e.offsetY + rect.top}px`);

      setRelativeX(`${e.offsetX}px`);
      setRelativeY(`${e.offsetY}px`);
      setShowMenu(true);
    },
    [setXPos, setYPos],
  );

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.querySelector('.greenArea').addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('click', handleClick);
      document.querySelector('.greenArea').removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleClick, handleContextMenu]);
  return (
    <Motion
      defaultStyle={{ opacity: 0 }}
      style={{ opacity: !showMenu ? spring(0) : spring(1) }}
    >
      {(interpolatedStyle) => (
        <>
          {showMenu ? (
            <div
              className="menu-container"
              style={{
                top: yPos,
                left: xPos,
                opacity: interpolatedStyle.opacity,
              }}
            >
              <ul
                className="menu"
                style={{
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
                                        key={idx}
                                        onClick={(e) => {
                                          funcs[idx](e, relativeX, relativeY);
                                        }}
                                      >
                                        {name}
                                      </MenuItem>
                                    ))
                                }
              </ul>
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </Motion>
  );
}
