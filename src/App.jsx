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
import {
  CANVAS_TRUE_WIDTH, CANVAS_TRUE_HEIGHT,
} from './constants';

export default function App() {
  const { bannerRef, mode } = React.useContext(GeneralContext);
  return (
    <div className="App">
      <CustomAlert ref={bannerRef} />

      <ActuationProvider>
        <CanvasProvider>
          <ControlPanel />
          <div
            style={{
              position: 'absolute',
              backgroundImage: 'url(chassis-with-background.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
              width: CANVAS_TRUE_WIDTH,
              height: CANVAS_TRUE_HEIGHT,
              top: 10,
              left: 50, // width of left control bar
            }}
          />
          {
            mode === 'PIN' && (
              <>
                <div style={{ position: 'absolute', left: 165, top: 113 }}>
                  <PinsTop />
                </div>
                <div style={{ position: 'absolute', left: 165, top: 773 }}>
                  <PinsBottom />
                </div>
              </>
            )
          }
          <Canvas />
          <Scroll />
        </CanvasProvider>
      </ActuationProvider>
    </div>
  );
}
