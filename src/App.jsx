import React, { useState } from 'react';
import { CanvasProvider } from './Contexts/CanvasProvider';
import { ActuationProvider } from './Contexts/ActuationProvider';

import Canvas from './Canvas/Canvas';
import Scroll from './Scroll';
import { ControlPanel } from './ControlPanel/ControlPanel';

export default function App() {
  const [mode, setMode] = useState("CAN") // either "PIN", "SEQ", or "CAN"

  return (
    <div className="App">
      <ActuationProvider>
        <CanvasProvider>
          <ControlPanel mode={mode} setMode={setMode} />
          <Canvas mode={mode} />
          <Scroll />
        </CanvasProvider>
      </ActuationProvider>
    </div>
  );
}
