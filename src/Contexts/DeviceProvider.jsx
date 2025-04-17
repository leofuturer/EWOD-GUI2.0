import React, { useState, useEffect } from 'react';
import db from './DBStorage';

const DeviceContext = React.createContext();

const DeviceProvider = ({ children }) => {
  const [id, setId] = useState(22353);

  useEffect( // idb stuff
    () => {
      // create the store

      // perform a read/write transatiction on the new store
      db.transaction('rw', db.formData, async () => {
        const deviceId = await db.formData.get('deviceId');
        // if there's no device id in local storage, add an empty one
        if (!deviceId) await db.formData.add({ id: 'deviceId', value: 22353 });
        else {
          setId(parseInt(deviceId, 10));
        }
      }).catch((e) => console.log(e.stack || e));
    },
    // run effect whenever the database connection changes
    [db],
  );

  const updateDeviceId = async (newDeviceId) => {
    try {
      // Update the state with the new device ID
      setId(newDeviceId);

      // Update the device ID in IndexedDB
      await db.formData.put({ id: 'deviceId', value: newDeviceId });
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
