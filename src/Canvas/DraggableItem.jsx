/* eslint-disable react/destructuring-assignment */
import React, {
  useRef, useEffect, useCallback, useContext, useState,
} from 'react';
import ReactDraggable from 'react-draggable';
import useSelected from './useSelected';
import useReset from './useReset';
import './Canvas.css';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ELEC_SIZE } from '../constants';

function DraggableItem({ id, children, mode }) {
  const context = useContext(CanvasContext);
  const { setSelected, setDelta, setDragging } = context;
  const {
    delta, mouseDown, drawing, isDragging,
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

  const handleMouseDown = useCallback((e) => {
    if (e.which === 1) {
      if (mode === 'CAN' && !isSelected && !drawing && !isDragging) {
        setSelected([...new Set([...elecSelected, id])]);
      }
    }
  }, [isDragging, setSelected, elecSelected, id, drawing, isSelected]);

  useEffect(() => {
    if (dragItem && dragItem.current) {
      const item = dragItem.current;
      item.addEventListener('mousedown', handleMouseDown);
      return () => {
        item.removeEventListener('mousedown', handleMouseDown);
      };
    }
    return undefined;
  }, [handleMouseDown]);

  // handles selection of existing electrodes
  const handleMouseOver = useCallback(() => {
    if (mouseDown === true && mode === 'CAN' && !isSelected && !drawing && !isDragging) {
      setSelected([...new Set([...elecSelected, id])]);
    }
  }, [isDragging, drawing, id, isSelected, mouseDown, elecSelected, setSelected]);

  useEffect(() => {
    if (dragItem && dragItem.current) {
      const item = dragItem.current;
      item.addEventListener('mouseover', handleMouseOver);
      return () => {
        item.removeEventListener('mouseover', handleMouseOver);
      };
    }
    return undefined;
  }, [handleMouseOver]);

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
