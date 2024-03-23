/* eslint-disable linebreak-style */
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
    // at this point, actuation sequence should be emptied
    // due to actuation tracking electrodes not pins
    // changing an electrode mapping causes many problems
    // thus, we preemptively have cleared actuation sequences in Pins<XXX>.jsx
    if (currElec && pin) {
      if (Object.prototype.hasOwnProperty.call(pinToElec, pin)) {
        if (pinToElec[pin] === currElec) {
          // when user wants to erase one pin <-> elec mapping
          // e.g. pin 100 <-> electrode S3
          // then hit pin 100 again while select electrode S3
          // then set the absolute state and return immediately
          setPinToElec((curr) => {
            const newObj = { ...curr };
            delete newObj[pin];
            return newObj;
          });
          setElecToPin((curr) => {
            const newObj = { ...curr };
            delete newObj[currElec];
            return newObj;
          });
          savedCallback.current();
          return;
        }
        // otherwise just delete local copy of state
        // going in these if statements means user wants to,
        // for instance, assign pin to ANOTHER electrode
        // than what that pin is currently assigned to
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
    }
    savedCallback.current();
  }, [pin]);
}
