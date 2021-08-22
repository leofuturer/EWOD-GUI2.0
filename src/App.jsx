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
  ELEC_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH,
} from './constants';

export default function App() {
  const { bannerRef, mode } = React.useContext(GeneralContext);
  const [scrollOpen, setScrollOpen] = React.useState(true);

  return (
    <div className="App">
      <CustomAlert ref={bannerRef} />

      <ActuationProvider>
        <CanvasProvider>
          <ControlPanel scrollOpen={scrollOpen} />
          <ConditionalWrapper
            condition={mode === 'PIN'}
            wrapper={(children) => (
              <div
                style={{
                  backgroundImage: 'url(chassis-with-background.svg)',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                  width: CANVAS_WIDTH * ELEC_SIZE,
                  height: CANVAS_HEIGHT * ELEC_SIZE,
                  paddingTop: 108,
                  paddingLeft: 115,
                  marginLeft: 50, // width of left control bar
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {children}
              </div>
            )}
          >
            {mode === 'PIN' ? <PinsTop /> : <></>}
            <Canvas />
            {mode === 'PIN' ? <PinsBottom /> : <></>}
          </ConditionalWrapper>
          <Scroll scrollOpen={scrollOpen} setScrollOpen={setScrollOpen} />
        </CanvasProvider>
      </ActuationProvider>
    </div>
  );
}

// https://blog.hackages.io/conditionally-wrap-an-element-in-react-a8b9a47fab2
const ConditionalWrapper = ({
  condition, wrapper, children,
}) => (condition ? wrapper(children) : children);
