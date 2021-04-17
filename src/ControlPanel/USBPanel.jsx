import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import './USBPanel.css';

export default function USBPanel() {
  const [volt, setVolt] = useState(0);
  const [freq, setFreq] = useState(0);

  function incVolt() {
    setVolt(volt + 5);
  }

  function decVolt() {
    setVolt(volt - 5);
  }

  function incFreq() {
    setFreq(freq + 5);
  }

  function decFreq() {
    setFreq(freq - 5);
  }

  return (
    <div style={{ display: 'block', padding: '10px' }}>
      <div>
        USB Connected?
      </div>
      <ButtonGroup className="inputCounters">
        <Button onClick={incVolt}>+</Button>
        <TextField
          id="tf-voltage"
          onChange={(e) => { setVolt(e.target.value); }}
          type="number"
          value={volt}
          label="Voltage"
        />
        <Button onClick={decVolt}>-</Button>
      </ButtonGroup>
      <div />
      <ButtonGroup className="inputCounters">
        <Button onClick={incFreq}>+</Button>
        <TextField
          id="tf-frequency"
          onChange={(e) => { setFreq(e.target.value); }}
          type="number"
          label="Frequency"
          value={freq}
        />
        <Button onClick={decFreq}>-</Button>
      </ButtonGroup>
      <div style={{ padding: '10px' }}>
        <Button variant="contained">Set Voltage to 0</Button>
      </div>
      <div id="setVPP" style={{ padding: '10px' }}>
        <Button variant="contained">Set Vpp</Button>
      </div>
    </div>
  );
}
