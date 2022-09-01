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

  const [actions, setActions] = useState({
    history: [],
    historyIndex: -1,
    filler: 0,
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
        actions,
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
        pushDrawHistory: (obj) => {
          /* const newHist = actions.history;
          newHist.length = actions.historyIndex + 1;
          newHist.push(obj);
          let newIndex = actions.historyIndex + 1;
          console.log(newHist);
          if (newHist.length > 10) {
            newHist.shift();
            newIndex -= 1;
          } */
          console.log(actions.history);
          setActions((stateBoi) => {
            if (obj.electrodeInfo.length !== 0) {
              const newHist = { ...stateBoi };
              newHist.history = newHist.history.slice(0, newHist.historyIndex + 1);
              newHist.history.push(obj);
              newHist.historyIndex += 1;
              return newHist;
            }
            return stateBoi;
          });
        },
        consoleHist: () => {
          console.log(actions.history, actions.historyIndex);
        },
        undoDraw: () => {
          if (actions.historyIndex > -1) {
            const obj = actions.history[actions.historyIndex];
            let newList = squares.electrodes;
            if (obj.type === 'draw') {
              newList = newList.filter((element) => element.ids !== obj.electrodeInfo.ids);
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
            } else if (obj.type === 'delete') {
              if (!obj.combined) {
                obj.electrodeInfo.forEach((delElec) => {
                  newList.push(delElec);
                });
                setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
              } else {
                const newComb = combined.allCombined;
                obj.electrodeInfo.forEach((delComb) => {
                  newComb.push(delComb);
                });
                setCombined((stateBoi) => ({ ...stateBoi, allCombined: newComb }));
              }
              const prevAction = actions.history[actions.historyIndex - 1];
              if (prevAction) {
                if (prevAction.type === 'combine') {
                  // handle combine layout change as well since we
                  // "delete" the single electrodes after combining them
                  const combObj = prevAction;
                  let newComb = combined.allCombined;
                  newComb = newComb.filter((element) => element[2] !== combObj.electrodeInfo[0][2]);
                  setCombined((stateBoi) => ({ ...stateBoi, allCombined: newComb }));
                  setActions((stateBoi) => ({
                    ...stateBoi,
                    historyIndex: actions.historyIndex - 2,
                  }));
                } else if (prevAction.type === 'separate') {
                  const sepObj = prevAction;
                  const delIds = [];
                  sepObj.electrodeInfo.forEach((element) => {
                    delIds.push(element.ids);
                  });
                  newList = newList.filter((element) => !delIds.includes(element.ids));
                  setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
                  setActions((stateBoi) => ({
                    ...stateBoi,
                    historyIndex: actions.historyIndex - 2,
                  }));
                }
                return;
              }
              setActions((stateBoi) => ({
                ...stateBoi,
                historyIndex: actions.historyIndex - 1,
              }));
            } else if (obj.type === 'paste') {
              const delIds = [];
              obj.electrodeInfo.forEach((element) => {
                delIds.push(element.ids);
              });
              newList = newList.filter((element) => !delIds.includes(element.ids));
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
            }
            setActions((stateBoi) => ({
              ...stateBoi,
              historyIndex: actions.historyIndex - 1,
            }));
          }
        },
        redoDraw: () => {
          if (actions.historyIndex < actions.history.length - 1) {
            const obj = actions.history[actions.historyIndex + 1];
            let newList = squares.electrodes;
            if (obj.type === 'draw') {
              const newElec = obj.electrodeInfo;
              newList.push(newElec);
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
            } else if (obj.type === 'delete') {
              const delIds = [];
              obj.electrodeInfo.forEach((element) => {
                delIds.push(element.ids);
              });
              newList = newList.filter((element) => !delIds.includes(element.ids));
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
            } else if (obj.type === 'paste') {
              obj.electrodeInfo.forEach((delElec) => {
                newList.push(delElec);
              });
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
            } else if (obj.type === 'combine') {
              // Redraw the combined electrodes
              // CURRENT BUG: NOT RERENDERING WHEN REDOING COMBINE
              const newCombs = combined.allCombined;
              obj.electrodeInfo.forEach((element) => {
                newCombs.push(element);
              });
              // Remove the single electrodes that just got combined
              const delObj = actions.history[actions.historyIndex + 2];
              const delIds = [];
              delObj.electrodeInfo.forEach((element) => {
                delIds.push(element.ids);
              });
              newList = newList.filter((element) => !delIds.includes(element.ids));
              setCombined((stateBoi) => ({ ...stateBoi, allCombined: newCombs }));
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newList }));
              // Have to advance the index twice since the delete is also being redone
              setActions((stateBoi) => ({
                ...stateBoi,
                historyIndex: actions.historyIndex + 2,
              }));
              return;
            } else if (obj.type === 'separate') {
              // Redraw the separated electrodes
              const newSep = squares.electrodes;
              obj.electrodeInfo.forEach((element) => {
                newSep.push(element);
              });
              // Remove the combined electrodes that got separated
              const delObj = actions.history[actions.historyIndex + 2];
              let newComb = combined.allCombined;
              newComb = newComb.filter((element) => element[2] !== delObj.electrodeInfo[0][2]);
              setCombined((stateBoi) => ({ ...stateBoi, allCombined: newComb }));
              setSquares((stateBoi) => ({ ...stateBoi, electrodes: newSep }));
            }
            setActions((stateBoi) => ({
              ...stateBoi,
              historyIndex: actions.historyIndex + 1,
            }));
          }
        },
        clearDraw: () => {
          setActions((stateBoi) => ({
            ...stateBoi,
            history: [],
            historyIndex: -1,
          }));
        },
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasProvider, CanvasContext };
