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

function DraggableItem({ ind, children, scaleXY }) {
  const { mode } = useContext(GeneralContext);

  const context = useContext(CanvasContext);
  const {
    setDelta, setDragging, setMoving, pushDrawHistory,
  } = context;
  const { delta, isDragging } = context.state;
  const { electrodes } = context.squares;
  const elecSelected = context.squares.selected;

  const { selected } = context.combined;

  // const combSelected = selected.length > 0 ? selected.map(Number) : null;

  const isSelected = elecSelected && elecSelected.indexOf(`${electrodes[ind].ids}`) >= 0;

  let transform = {};
  let boop;
  if (delta === null) boop = { x: 0, y: 0 };
  else boop = delta;

  const { deltas } = electrodes[ind];
  if (isSelected) transform = { transform: `translate(${boop.x + deltas[0]}px, ${boop.y + deltas[1]}px)` };
  else transform = { transform: `translate(${deltas[0]}px, ${deltas[1]}px)` };

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
          if (delta.x !== 0 || delta.y !== 0) {
            setSaveChanges(true);
            pushDrawHistory({
              type: 'move',
              squares: JSON.parse(JSON.stringify(electrodes)),
              select: JSON.parse(JSON.stringify(selected)),
            });
          } else setResetting(true);
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
