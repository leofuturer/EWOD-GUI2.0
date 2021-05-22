import React from 'react';
import { GeneralContext } from '../Contexts/GeneralProvider';

export default function useMap(callback, pin) {
  const savedCallback = React.useRef();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const {
    currElec, pinToElec, setPinToElec, elecToPin, setElecToPin,
  } = React.useContext(GeneralContext);

  React.useEffect(() => {
    if (currElec && pin) {
      if (Object.prototype.hasOwnProperty.call(pinToElec, pin)) {
        delete elecToPin[pinToElec[pin]];
      }
      if (Object.prototype.hasOwnProperty.call(elecToPin, currElec)) {
        delete pinToElec[elecToPin[currElec]];
      }
      setPinToElec((curr) => {
        const newObj = { ...curr };
        newObj[pin] = currElec;
        return newObj;
      });
      setElecToPin((curr) => {
        const newObj = { ...curr };
        newObj[currElec] = pin;
        return newObj;
      });
      savedCallback.current();
    }
  }, [pin]);
}
