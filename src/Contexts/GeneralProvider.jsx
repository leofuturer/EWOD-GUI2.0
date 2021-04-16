import React from 'react';

const GeneralContext = React.createContext();

const GeneralProvider = ({ children }) => {
  const [mode, setMode] = React.useState('CAN'); // either "PIN", "SEQ", or "CAN"
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
