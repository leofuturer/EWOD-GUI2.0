import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import './USBPanel.css';

export default function USBPanel() {
  const [volt, setVolt] = useState(0);
  const [freq, setFreq] = useState(0);

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

  return (
    <div style={{ display: 'block', paddingLeft: '20px' }}>
      <div>
        USB Connected?
      </div>
      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button onClick={() => setAndCheckVolt(volt + 5)}>+</Button>
          <TextField
            id="tf-voltage"
            onChange={(e) => { setVolt(e.target.value); }}
            type="number"
            value={volt}
            onBlur={() => { if (volt > 180 || volt < 0) { setVolt(0); } }}
          />
          <Button onClick={() => setAndCheckVolt(volt - 5)}>-</Button>
        </ButtonGroup>
        <div style={{ float: 'left', paddingTop: '15px' }} className="unit"> V </div>
      </div>
      <div />
      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button onClick={() => setAndCheckFreq(freq + 5)}>+</Button>
          <TextField
            id="tf-frequency"
            onChange={(e) => { setFreq(e.target.value); }}
            type="number"
            value={freq}
            onBlur={() => { if (freq > 10000 || freq < 0) { setFreq(0); } }}
          />
          <Button onClick={() => setAndCheckFreq(freq - 5)}>-</Button>
        </ButtonGroup>
        <div style={{ float: 'left', paddingTop: '15px' }} className="unit"> HZ </div>
      </div>
      <div style={{ paddingLeft: '10px', paddingTop: '140px' }}>
        <Button variant="contained">Set Voltage to 0</Button>
      </div>
      <div style={{ padding: '10px' }}>
        <Button variant="contained">Test</Button>
      </div>
      <div className="rButton" style={{ padding: '15px' }}>
        <Button variant="contained">Set Vpp</Button>
      </div>
    </div>
  );
}
