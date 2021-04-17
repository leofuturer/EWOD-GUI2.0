import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import './USBPanel.css';
import {
  initiateConnection, setV, setF, setPin, isDeviceConnected,
} from '../USBCommunication/USBCommunication';

export default function USBPanel(props) {
  const [volt, setVolt] = useState(0);
  const [freq, setFreq] = useState(0);
  const [usbConnected, setUsbConnected] = useState(false);

  let timeOut = null;

  function setAndCheckVolt(v) {
    if (v <= 180 && v >= 0) {
      setVolt(v);
    }
  }

  function setAndCheckFreq(f) {
    if (f <= 10000 && f >= 0) {
      setFreq(f);
    }
  }

  function setZero() {
    if (isDeviceConnected()) {
      setV(0);
      setF(0);
    }
  }

  function disconnect() {
    if (props.setUsbConnected) {
      props.setUsbConnected(false);
      setUsbConnected(false);
    }
  }

  function recvData() {
    if (timeOut) clearTimeout(timeOut);

    if (props.setUsbConnected) {
      props.setUsbConnected(true);
      setUsbConnected(true);
      timeOut = setTimeout(disconnect, 3000);
    }
  }

  function setVpp() {
    if (isDeviceConnected()) {
      setV(volt);
      setF(freq);
    }
  }

  function handleConnect() {
    initiateConnection(recvData);
  }

  function test() {
    if (isDeviceConnected()) {
      setPin([9, 10, 11, 12, 13], 1);
    }
  }

  return (
    <div style={{ display: 'block', paddingLeft: '20px' }}>
      <div>
        USB Connected
        { usbConnected ? <CheckCircleIcon className="icon" style={{ color: '#21b214' }} /> : <CancelIcon className="icon" color="secondary" /> }
      </div>

      <div style={{ padding: '10px' }}>
        <Button variant="contained" onClick={handleConnect}> Connect </Button>
      </div>

      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button onClick={() => setAndCheckFreq(freq - 5)}>-</Button>
          <TextField
            id="tf-frequency"
            onChange={(e) => { setFreq(e.target.value); }}
            type="number"
            value={freq}
            onBlur={() => { if (freq > 10000 || freq < 0) { setFreq(0); } }}
          />
          <Button onClick={() => setAndCheckFreq(freq + 5)}>+</Button>
        </ButtonGroup>
        <div style={{ float: 'left', paddingTop: '15px' }} className="unit"> HZ </div>
      </div>

      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button onClick={() => setAndCheckVolt(volt - 5)}>-</Button>
          <TextField
            id="tf-voltage"
            onChange={(e) => { setVolt(e.target.value); }}
            type="number"
            value={volt}
            onBlur={() => { if (volt > 180 || volt < 0) { setVolt(0); } }}
          />
          <Button onClick={() => setAndCheckVolt(volt + 5)}>+</Button>
        </ButtonGroup>
        <div style={{ float: 'left', paddingTop: '15px' }} className="unit"> V </div>
      </div>

      <div />

      <div style={{ paddingLeft: '10px', paddingTop: '140px' }}>
        <Button onClick={setZero} variant="contained">Set Voltage to 0</Button>
      </div>

      <div style={{ padding: '10px' }}>
        <Button variant="contained" onClick={test}>Test</Button>
      </div>

      <div className="rButton" style={{ padding: '15px' }}>
        <Button onClick={setVpp} variant="contained">Set Vpp</Button>
      </div>

    </div>
  );
}
