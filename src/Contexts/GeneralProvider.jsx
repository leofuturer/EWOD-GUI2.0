import React, { useState } from 'react';

const GeneralContext = React.createContext();

const GeneralProvider = ({ children }) => {
  const [mode, setMode] = useState('DRAW'); // either "PIN", "SEQ", or "CAN", or "DRAW"
  const [pinToCoord, setPinMap] = useState(new Map());
  const [coordToPin, setCoordMap] = useState(new Map());

  const [indToPin, setIndMap] = useState(new Map());
  const [pinToInd, setPinMap2] = useState(new Map());

  const [currPin, setCurrPin] = useState(null);
  const [pinToElec, setPinToElec] = useState({});

  const bannerRef = React.useRef();

  return (
    <GeneralContext.Provider
      value={{
        mode,
        setMode,
        bannerRef,
        pinToCoord,
        setPinMap,
        coordToPin,
        setCoordMap,
        indToPin,
        setIndMap,
        pinToInd,
        setPinMap2,
        currPin,
        setCurrPin,
        pinToElec,
        setPinToElec,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export { GeneralProvider, GeneralContext };
