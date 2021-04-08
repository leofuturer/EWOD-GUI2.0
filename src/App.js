import React, { Component } from 'react';
import { CanvasProvider } from './Contexts/CanvasProvider';
import { ActuationProvider } from './Contexts/ActuationProvider';

import Canvas from './Canvas/Canvas';
import Scroll from './Scroll.js';
import { ControlPanel } from './ControlPanel/ControlPanel';

export default class App extends Component {
  render() {
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
}
