import React from 'react';

const GeneralContext = React.createContext();

const GeneralProvider = ({ children }) => {
  const [mode, setMode] = React.useState('DRAW'); // either "PIN", "SEQ", "CAN", or "DRAW"
  const bannerRef = React.useRef();

  return (
    <GeneralContext.Provider
      value={{
        mode,
        setMode,
        bannerRef,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export { GeneralProvider, GeneralContext };
