import React, { useState } from 'react';

const GeneralContext = React.createContext();

const GeneralProvider = ({ children }) => {
  const [mode, setMode] = useState('DRAW'); // either "PIN", "SEQ", or "CAN", or "DRAW"
  const [currPin, setCurrPin] = useState(null);
  const [pinToElec, setPinToElec] = useState({});
  const [elecToPin, setElecToPin] = useState({});

  const bannerRef = React.useRef();

  React.useEffect(() => {
    console.log(pinToElec);
    console.log(elecToPin);
  }, [pinToElec, elecToPin]);

  return (
    <GeneralContext.Provider
      value={{
        mode,
        setMode,
        bannerRef,
        currPin,
        setCurrPin,
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
