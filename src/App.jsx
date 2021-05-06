import React from 'react';
import { CanvasProvider } from './Contexts/CanvasProvider';
import { ActuationProvider } from './Contexts/ActuationProvider';
import { GeneralContext } from './Contexts/GeneralProvider';

import Canvas from './Canvas/Canvas';
import Scroll from './Actuation/Scroll';
import ControlPanel from './ControlPanel/ControlPanel';
import PinsTop from './Pins/PinsTop';
import PinsBottom from './Pins/PinsBottom';
import CustomAlert from './Alert';

export default function App() {
  const { bannerRef } = React.useContext(GeneralContext);
  return (
    <div className="App">
      <CustomAlert ref={bannerRef} />

      <ActuationProvider>
        <CanvasProvider>
          <ControlPanel />
          <PinsTop />
          <Canvas />
          <PinsBottom />
          <Scroll />
        </CanvasProvider>
      </ActuationProvider>
    </div>
  );
}
