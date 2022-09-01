import React, { useState } from 'react';
import db from './DBStorage';
import useInterval from '../useInterval';
import handleSave from '../ControlPanel/handleSave';

const GeneralContext = React.createContext();

const GeneralProvider = ({ children }) => {
  const [mode, setMode] = useState('DRAW'); // either "PIN", "SEQ", or "CAN", or "DRAW"
  const [panning, setPanning] = useState(false);
  const [currElec, setCurrElec] = useState(null);
  const [pinToElec, setPinToElec] = useState({});
  const [elecToPin, setElecToPin] = useState({});
  const [pinActions, setPinActions] = useState({
    history: [],
    historyIndex: -1,
  });

  const bannerRef = React.useRef();

  const [scaleXY, setScaleXY] = useState({ scale: 1, svgX: 0, svgY: 0 });

  React.useEffect( // idb stuff
    () => {
      db.transaction('rw', db.formData, async () => {
        // get elec layout from the data
        const pinToElecRaw = await db.formData.get('pinToElec');

        // if there's no layout in local storage, add an empty one
        if (!pinToElecRaw) await db.formData.add({ id: 'pinToElec', value: [] });
        else {
          const pinToElecObj = JSON.parse(pinToElecRaw.value[0]);
          setPinToElec(pinToElecObj);
        }

        const elecToPinRaw = await db.formData.get('elecToPin');

        // if there's no layout in local storage, add an empty one
        if (!elecToPinRaw) await db.formData.add({ id: 'elecToPin', value: [] });
        else {
          const elecToPinObj = JSON.parse(elecToPinRaw.value[0]);
          setElecToPin(elecToPinObj);
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
    handleSave(null, null, null, pinToElec, elecToPin, db);
  }, 10000);

  return (
    <GeneralContext.Provider
      value={{
        scaleXY,
        setScaleXY,
        mode,
        setMode,
        panning,
        setPanning,
        bannerRef,
        currElec,
        setCurrElec,
        pinToElec,
        setPinToElec,
        elecToPin,
        setElecToPin,
        pinActions,
        setPinActions,
        pushPinHistory: (obj) => {
          const newHist = pinActions.history;
          newHist.push(obj);
          const newIndex = pinActions.historyIndex + 1;
          console.log(pinActions.history);
          setPinActions((stateBoi) => ({ ...stateBoi, history: newHist, historyIndex: newIndex }));
        },
        undoPin: () => {
          if (pinActions.historyIndex > -1) {
            const obj = pinActions.history[pinActions.historyIndex];
            if (obj.type === 'map') {
              setPinToElec((curr) => {
                const newObj = { ...curr };
                delete newObj[obj.pinAff];
                return newObj;
              });
              setElecToPin((curr) => {
                const newObj = { ...curr };
                delete newObj[obj.elecAff];
                return newObj;
              });
            } else if (obj.type === 'unmap') {
              setPinToElec((curr) => {
                const newObj = { ...curr };
                newObj[obj.pinAff] = obj.elecAff;
                return newObj;
              });
              setElecToPin((curr) => {
                const newObj = { ...curr };
                newObj[obj.elecAff] = obj.pinAff;
                return newObj;
              });
            }
            setPinActions({ ...pinActions, historyIndex: pinActions.historyIndex - 1 });
          }
        },
        redoPin: () => {
          if (pinActions.historyIndex < pinActions.history.length - 1) {
            const obj = pinActions.history[pinActions.historyIndex + 1];
            if (obj.type !== 'map') {
              setPinToElec((curr) => {
                const newObj = { ...curr };
                delete newObj[obj.pinAff];
                return newObj;
              });
              setElecToPin((curr) => {
                const newObj = { ...curr };
                delete newObj[obj.elecAff];
                return newObj;
              });
            } else {
              setPinToElec((curr) => {
                const newObj = { ...curr };
                newObj[obj.pinAff] = obj.elecAff;
                return newObj;
              });
              setElecToPin((curr) => {
                const newObj = { ...curr };
                newObj[obj.elecAff] = obj.pinAff;
                return newObj;
              });
            }
            setPinActions({ ...pinActions, historyIndex: pinActions.historyIndex + 1 });
          }
        },
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export { GeneralProvider, GeneralContext };
