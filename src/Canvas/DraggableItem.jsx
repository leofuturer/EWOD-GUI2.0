/* eslint-disable react/destructuring-assignment */
import React, {
  useRef, useEffect, useCallback, useContext, useState,
} from 'react';
import ReactDraggable from 'react-draggable';
import useSelected from './useSelected';
import useReset from './useReset';
import './Canvas.css';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import { ELEC_SIZE } from '../constants';

function DraggableItem({ id, children }) {
  const {
    mode, setCurrElec,
  } = useContext(GeneralContext);

  const context = useContext(CanvasContext);
  const { setSelected, setDelta, setDragging } = context;
  const {
    delta, mouseDown, isDragging,
  } = context.state;
  const { electrodes } = context.squares;
  const elecSelected = context.squares.selected;

  const { deltas } = electrodes;

  const isSelected = elecSelected && elecSelected.indexOf(id) >= 0;

  let transform = {};
  let boop;
  if (delta === null) boop = { x: 0, y: 0 };
  else boop = delta;

  if (isSelected) transform = { transform: `translate(${boop.x + deltas[id][0]}px, ${boop.y + deltas[id][1]}px)` };
  else transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` };

  const dragItem = useRef(null);

  const [localMD, setLocalMD] = useState(false);

  const handleMouseDown = useCallback((e) => {
    if (e.which === 1) {
      if (mode === 'PIN') {
        setCurrElec(`S${id}`);
      } else if (mode !== 'DRAW' && !isDragging) {
        if (isSelected) {
          setLocalMD(true);
        } else {
          setSelected([...new Set([...elecSelected, id])]);
        }
      }
    }
  }, [isDragging, setSelected, elecSelected, id, mode, isSelected]);

  const handleMouseUp = useCallback(() => {
    if (mode !== 'DRAW' && isSelected && !isDragging && localMD) {
      setSelected(elecSelected.filter((x) => x !== id));
      setLocalMD(false);
    }
  }, [isDragging, setSelected, elecSelected, id, mode, isSelected]);

  const handleMouseOver = useCallback(() => {
    if (mouseDown === true && mode !== 'DRAW' && !isDragging) {
      if (isSelected) {
        setSelected(elecSelected.filter((x) => x !== id));
      } else {
        setSelected([...new Set([...elecSelected, id])]);
      }
    }
  }, [isDragging, mode, id, isSelected, mouseDown, elecSelected, setSelected]);

  useEffect(() => {
    if (dragItem && dragItem.current) {
      const item = dragItem.current;
      item.addEventListener('mousedown', handleMouseDown);
      item.addEventListener('mouseover', handleMouseOver);
      item.addEventListener('mouseup', handleMouseUp);
      return () => {
        item.removeEventListener('mousedown', handleMouseDown);
        item.removeEventListener('mouseover', handleMouseOver);
        item.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [handleMouseDown, handleMouseOver, handleMouseUp]);

  const [savingChanges, setSaveChanges] = useState(false);

  useSelected(() => {
    setSaveChanges(false);
  }, savingChanges);

  const [resetting, setResetting] = useState(false);
  useReset(() => {
    setResetting(false);
  }, resetting);

  return (
    <ReactDraggable
      axis="none"
      onStart={() => {
        setDelta({ x: 0, y: 0 });
      }}
      onDrag={(e, data) => {
        setDelta({ x: data.x, y: data.y });
        setDragging(true);
      }}
      onStop={() => {
        if (isDragging) {
          if (delta.x !== 0 || delta.y !== 0) setSaveChanges(true);
          else setResetting(true);
          setDragging(false);
        }
      }}
      position={{ x: 0, y: 0 }}
      disabled={mode !== 'CAN' || !isSelected}
      grid={[ELEC_SIZE, ELEC_SIZE]}
      nodeRef={dragItem}
    >
      <g ref={dragItem}>
        <g style={transform}>
          {children}
        </g>
      </g>
    </ReactDraggable>
  );
}

export default DraggableItem;
