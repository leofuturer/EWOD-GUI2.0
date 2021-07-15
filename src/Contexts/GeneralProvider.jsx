import React, { useState } from 'react';
import db from './DBStorage';
import useInterval from '../useInterval';
import handleSave from '../ControlPanel/handleSave';

const GeneralContext = React.createContext();

const GeneralProvider = ({ children }) => {
  const [mode, setMode] = useState('DRAW'); // either "PIN", "SEQ", or "CAN", or "DRAW"
  const [currElec, setCurrElec] = useState(null);
  const [pinToElec, setPinToElec] = useState({});
  const [elecToPin, setElecToPin] = useState({});

  const bannerRef = React.useRef();

  React.useEffect(() => {
    console.log(pinToElec);
    console.log(elecToPin);
  }, [pinToElec, elecToPin]);

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
        mode,
        setMode,
        bannerRef,
        currElec,
        setCurrElec,
        pinToElec,
        setPinToElec,
        elecToPin,
        setElecToPin,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export { GeneralProvider, GeneralContext };
