import React, { useState, useEffect } from 'react';
import db from './DBStorage';
import useInterval from '../useInterval';
import handleSave from '../ControlPanel/handleSave';
import { GeneralContext } from './GeneralProvider';

const CanvasContext = React.createContext();

const CanvasProvider = ({ children }) => {
  const [squares, setSquares] = useState({
    electrodes: {
      initPositions: [],
      deltas: [],
      ids: [],
    },
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

  const [history, setHistory] = useState({
    content: [],
    index: -1,
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
              ids: [...new Array(dels.length).keys()],
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
        canUndo: () => {
          if (history.index > -1) {
            const latestDiff = history.content[history.index];
            // need to just keep track of combined and square elecs
            // will look like
            // {
            //    "+S": [{
            //       "x": 70,
            //       "y": 105,
            //       "id": "1",
            //    }, ...],
            //    "+C": [{
            //      "x": 140,
            //      "y": 140,
            //      "id": "2",
            //    }, ...],
            //    "-S": ...,
            //    "-C": ...,
            // }

            if (latestDiff['+S']) { // want to delete these squares
              const inds = latestDiff['+S'].map((obj) => (
                squares.electrodes.ids.indexOf(obj.id)
              ));
              const indsToDelete = new Set(inds);
              squares.electrodes.initPositions = squares.electrodes.initPositions
                .filter((val, ind) => !indsToDelete.has(ind));
              squares.electrodes.deltas = squares.electrodes.deltas
                .filter((val, ind) => !indsToDelete.has(ind));
              squares.electrodes.ids = squares.electrodes.ids
                .filter((val, ind) => !indsToDelete.has(ind));

              setSquares({
                electrodes: squares.electrodes,
                selected: [],
              });
            } else if (latestDiff['-S']) { // want to add these squares
              latestDiff['-S'].forEach((obj) => {
                squares.electrodes.initPositions.push([obj.x, obj.y]);
                squares.electrodes.deltas.push([0, 0]);
                squares.electrodes.ids.push(obj.id);
              });

              setSquares({
                electrodes: squares.electrodes,
                selected: [],
              });
            }

            setHistory((old) => ({
              ...old,
              index: old.index - 1,
            }));
          }
        },
        canRedo: () => {

        },
        pushCanHistory: (obj) => {
          setHistory((oldHistory) => {
            if (oldHistory.index === oldHistory.content.length - 1) {
              return {
                content: oldHistory.content.concat(obj),
                index: oldHistory.index + 1,
              };
            }
            const newHistoryContent = [...oldHistory.content];
            newHistoryContent[oldHistory.index + 1] = obj;
            return {
              content: newHistoryContent,
              index: oldHistory.index + 1,
            };
          });
        },
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasProvider, CanvasContext };
