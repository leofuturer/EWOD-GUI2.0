import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import useInterval from '../useInterval';
import { handleSave } from '../ControlPanel/SaveButton';

const CanvasContext = React.createContext();

const CanvasProvider = (props) => {
  const [squares, setSquares] = useState({
    electrodes: {
      initPositions: [],
      deltas: [],
    },
    selected: [],
  });

  const [state, setState] = useState({
    delta: null,
    mouseDown: false,
    drawing: false,
    db: new Dexie('ElecDB'),
    isDragging: false,
    selecting: true,
  });

  const [combined, setCombined] = useState({
    selected: [],
    allCombined: [],
  });

  useEffect( // idb stuff
    () => {
      // create the store
      state.db.version(1).stores({ formData: 'id,value' });

      // perform a read/write transatiction on the new store
      state.db.transaction('rw', state.db.formData, async () => {
        // get elec layout from the data
        const squaresLayout = await state.db.formData.get('squares');

        // if there's no layout in local storage, add an empty one
        if (!squaresLayout) await state.db.formData.add({ id: 'squares', value: [] });
        else {
          const initPos = []; const
            dels = [];
          squaresLayout.value.forEach((e) => {
            const mapping = e.split(' ');
            if (mapping[0] === 'square') {
              initPos.push([parseInt(mapping[1]), parseInt(mapping[2])]);
              dels.push([0, 0]);
            }
          });
          setSquares((stateBoi) => ({ ...stateBoi, electrodes: { initPositions: initPos, deltas: dels } }));
        }

        const combsLayout = await state.db.formData.get('combine');

        // if there's no layout in local storage, add an empty one
        if (!combsLayout) await state.db.formData.add({ id: 'combine', value: [] });
        else {
          const combs = [];
          combsLayout.value.forEach((e) => {
            const mapping = e.split(' ');
            if (mapping[0] === 'combine') combs.push([parseInt(mapping[1]), parseInt(mapping[2]), parseInt(mapping[3])]);
          });
          setCombined((stateBoi) => ({ ...stateBoi, allCombined: combs }));
        }
      }).catch((e) => console.log(e.stack || e));

      // close the database connection if form is unmounted or the
      // database connection changes
      return () => state.db.close();
    },
    // run effect whenever the database connection changes
    [state.db],
  );

  useInterval(() => {
    handleSave(squares.electrodes, combined.allCombined, state.db);
  }, 10000);

  return (
    <CanvasContext.Provider
      value={{
        state,
        squares,
        combined,
        setDragging: (bool) => { setState((stateBoi) => ({ ...stateBoi, isDragging: bool })); },
        setCombSelected: (newSelected) => { setCombined((stateBoi) => ({ ...stateBoi, selected: newSelected })); },
        setComboLayout: (newCombs) => { setCombined((stateBoi) => ({ ...stateBoi, allCombined: newCombs })); },
        setSelected: (newSelected) => { setSquares((stateBoi) => ({ ...stateBoi, selected: newSelected })); },
        setElectrodes: (elecs) => { setSquares((stateBoi) => ({ ...stateBoi, electrodes: elecs })); },
        setDelta: (del) => { setState((stateBoi) => ({ ...stateBoi, delta: del })); },
        setMouseDown: (md) => { setState((stateBoi) => ({ ...stateBoi, mouseDown: md })); },
        setDrawing: (draw) => { setState((stateBoi) => ({ ...stateBoi, drawing: draw })); },
        setSelecting: (bool) => { setState((stateBoi) => ({ ...stateBoi, selecting: bool })); },
      }}
    >
      {props.children}
    </CanvasContext.Provider>
  );
};

export { CanvasProvider, CanvasContext };
