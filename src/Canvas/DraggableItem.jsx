/* eslint-disable react/destructuring-assignment */
import React, {
  useRef, useContext, useState,
} from 'react';
import ReactDraggable from 'react-draggable';
import useSelected from './useSelected';
import useReset from './useReset';
import './Canvas.css';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import { ELEC_SIZE } from '../constants';

function DraggableItem({ id, children, scaleXY }) {
  const { mode } = useContext(GeneralContext);

  const context = useContext(CanvasContext);
  const { setDelta, setDragging, setMoving } = context;
  const { delta, isDragging } = context.state;
  const { electrodes } = context.squares;
  const elecSelected = context.squares.selected;

  const { deltas } = electrodes;

  const isSelected = elecSelected && elecSelected.indexOf(`${id}`) >= 0;

  let transform = {};
  let boop;
  if (delta === null) boop = { x: 0, y: 0 };
  else boop = delta;

  if (isSelected) transform = { transform: `translate(${boop.x + deltas[id][0]}px, ${boop.y + deltas[id][1]}px)` };
  else transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` };

  const dragItem = useRef(null);

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
        setDelta({
          // eslint-disable-next-line no-mixed-operators
          x: Math.round(data.x / scaleXY.scale / ELEC_SIZE) * ELEC_SIZE,
          // eslint-disable-next-line no-mixed-operators
          y: Math.round(data.y / scaleXY.scale / ELEC_SIZE) * ELEC_SIZE,
        });
        setDragging(true);
      }}
      onStop={() => {
        if (isDragging) {
          if (delta.x !== 0 || delta.y !== 0) setSaveChanges(true);
          else setResetting(true);
          setMoving(false);
          setDragging(false);
        }
        return false;
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
