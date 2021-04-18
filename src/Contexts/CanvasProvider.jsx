import React, { useState, useEffect } from 'react';
import db from './DBStorage';
import useInterval from '../useInterval';
import handleSave from '../ControlPanel/handleSave';

const CanvasContext = React.createContext();

const CanvasProvider = ({ children }) => {
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
    isDragging: false,
  });

  const [combined, setCombined] = useState({
    selected: [],
    allCombined: [],
  });

  useEffect( // idb stuff
    () => {
      // create the store

      // perform a read/write transatiction on the new store
      db.transaction('rw', db.formData, async () => {
        // get elec layout from the data
        const squaresLayout = await db.formData.get('squares');

        // if there's no layout in local storage, add an empty one
        if (!squaresLayout) await db.formData.add({ id: 'squares', value: [] });
        else {
          const initPos = []; const
            dels = [];
          squaresLayout.value.forEach((e) => {
            const mapping = e.split(' ');
            if (mapping[0] === 'square') {
              initPos.push([parseInt(mapping[1], 10), parseInt(mapping[2], 10)]);
              dels.push([0, 0]);
            }
          });
          setSquares((stateBoi) => ({
            ...stateBoi,
            electrodes: {
              initPositions: initPos,
              deltas: dels,
            },
          }));
        }

        const combsLayout = await db.formData.get('combine');

        // if there's no layout in local storage, add an empty one
        if (!combsLayout) await db.formData.add({ id: 'combine', value: [] });
        else {
          const combs = [];
          combsLayout.value.forEach((e) => {
            const mapping = e.split(' ');
            if (mapping[0] === 'combine') combs.push([parseInt(mapping[1], 10), parseInt(mapping[2], 10), parseInt(mapping[3], 10)]);
          });
          setCombined((stateBoi) => ({ ...stateBoi, allCombined: combs }));
        }
      }).catch((e) => console.log(e.stack || e));

      // close the database connection if form is unmounted or the
      // database connection changes
      // return () => db.close();
    },
    // run effect whenever the database connection changes
    [db],
  );

  useInterval(() => {
    handleSave(squares.electrodes, combined.allCombined, null, db);
  }, 10000);

  return (
    <CanvasContext.Provider
      value={{
        state,
        squares,
        combined,
        setDragging: (bool) => { setState((stateBoi) => ({ ...stateBoi, isDragging: bool })); },
        setCombSelected: (newSelected) => {
          setCombined((stateBoi) => ({ ...stateBoi, selected: newSelected }));
        },
        setComboLayout: (newCombs) => {
          setCombined((stateBoi) => ({ ...stateBoi, allCombined: newCombs }));
        },
        setSelected: (newSelected) => {
          setSquares((stateBoi) => ({ ...stateBoi, selected: newSelected }));
        },
        setElectrodes: (elecs) => {
          setSquares((stateBoi) => ({ ...stateBoi, electrodes: elecs }));
        },
        setDelta: (del) => {
          setState((stateBoi) => ({ ...stateBoi, delta: del }));
        },
        setMouseDown: (md) => {
          setState((stateBoi) => ({ ...stateBoi, mouseDown: md }));
        },
        setDrawing: (draw) => {
          setState((stateBoi) => ({ ...stateBoi, drawing: draw }));
        },
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasProvider, CanvasContext };
