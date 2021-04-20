import React from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';

export default function useReset(callback, resetting) {
  const savedCallback = React.useRef();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const context = React.useContext(CanvasContext);
  const { setSelected, setCombSelected } = context;

  React.useEffect(() => {
    if (resetting) {
      setSelected([]);
      setCombSelected([]);

      savedCallback.current();
    }
  }, [setCombSelected, setSelected, resetting]);
}
