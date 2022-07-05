import React, { useState, useEffect } from 'react';
import db from './DBStorage';
import useInterval from '../useInterval';
import handleSave from '../ControlPanel/handleSave';
import { GeneralContext } from './GeneralProvider';

const CanvasContext = React.createContext();

const CanvasProvider = ({ children }) => {
  const [squares, setSquares] = useState({
    // each electrode is a dictionary with keys `initPositions`, `deltas`, and `ids`
    electrodes: [],
    selected: [],
  });

  const [state, setState] = useState({
    delta: null,
    mouseDown: false,
    drawing: false,
    isDragging: false,
    moving: false,
  });

  const [combined, setCombined] = useState({
    selected: [],
    allCombined: [],
  });

  const { elecToPin } = React.useContext(GeneralContext);

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
          const tempElectrodes = [];
          let tempId = 0;
          squaresLayout.value.forEach((e) => {
            const mapping = e.split(' ');
            if (mapping[0] === 'square') {
              const temp = {};
              temp.initPositions = [parseInt(mapping[1], 10), parseInt(mapping[2], 10)];
              temp.deltas = [0, 0];
              temp.ids = tempId;
              tempId += 1;
              tempElectrodes.push(temp);
            }
          });
          setSquares((stateBoi) => ({
            ...stateBoi,
            electrodes: tempElectrodes,
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
    handleSave(squares.electrodes, combined.allCombined, null, null, elecToPin, db);
  }, 10000);

  return (
    <CanvasContext.Provider
      value={{
        state,
        squares,
        combined,
        setMoving: (bool) => { setState((stateBoi) => ({ ...stateBoi, moving: bool })); },
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
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasProvider, CanvasContext };
