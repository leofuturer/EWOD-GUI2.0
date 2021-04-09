import React from 'react';
import { CanvasProvider } from './Contexts/CanvasProvider';
import { ActuationProvider } from './Contexts/ActuationProvider';

import Canvas from './Canvas/Canvas';
import Scroll from './Scroll';
import { ControlPanel } from './ControlPanel/ControlPanel';

export default function App() {
  return (
    <div className="App">
      <ActuationProvider>
        <CanvasProvider>
          <ControlPanel />
          <Canvas />
          <Scroll />
        </CanvasProvider>
      </ActuationProvider>
    </div>
  );
}
