import React, { useState, useEffect } from 'react';

const DeviceContext = React.createContext();

const DeviceProvider = ({ children }) => {
  const [id, setId] = useState(22353);

  useEffect( // idb stuff
    () => {
      // create the store

      // perform a read/write transatiction on the new store
      const deviceId = localStorage.getItem('deviceId');
      console.log('Initial device id');
      console.log(deviceId);
      if (!deviceId) localStorage.setItem('deviceId', 22353);

      else setId(parseInt(deviceId, 10));
    },
    // run effect whenever the database connection changes
    [],
  );

  const updateDeviceId = async (newDeviceId) => {
    try {
      // Update the state with the new device ID
      // console.log(`trying to set id ${newDeviceId}`);
      console.log(id);
      console.log(localStorage.getItem('deviceId'));
      setId(newDeviceId);
      localStorage.setItem('deviceId', newDeviceId);
    } catch (e) {
      console.error('Error updating deviceId:', e.stack || e);
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        id,
        setId: updateDeviceId,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export { DeviceProvider, DeviceContext };
