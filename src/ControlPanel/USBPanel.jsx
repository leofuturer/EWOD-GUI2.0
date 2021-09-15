import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { makeStyles } from '@material-ui/styles';
import icons from '../Icons/icons';

import './USBPanel.css';
import {
  initiateConnection, setV, setF, setPin, isDeviceConnected,
} from '../USBCommunication/USBCommunication';

const useStyles = makeStyles({
  transparentBtn: {
    border: 'none',
  },
  brownBtn: {
    border: '2px solid #A06933',
    color: '#FEFAE0',
    backgroundColor: '#D4A373',
    fontWeight: 900,
    fontSize: '14px',
    textTransform: 'none',
    boxShadow: 'inset 0px 3px 4px rgba(250, 237, 205, 0.5)',
  },
  grayBtn: {
    border: '2px solid #7D7B79',
    color: '#FEFAE0',
    backgroundColor: '#AEAEAE',
    fontWeight: 900,
    fontSize: '14px',
    textTransform: 'none',
    boxShadow: 'inset 0px 3px 4px rgba(255, 255, 255, 0.5)',
  },
});

export default function USBPanel({ usbConnected, setUsbConnected }) {
  const classes = useStyles();

  const [volt, setVolt] = useState(0);
  const [freq, setFreq] = useState(0);

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
    if (setUsbConnected) {
      setUsbConnected(false);
    }
  }

  function recvData() {
    if (timeOut) clearTimeout(timeOut);

    if (setUsbConnected) {
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
    <div id="usb-panel">
      <div id="usb-connect-status">
        {usbConnected
          ? (
            <>
              USB Connected
              <CheckCircleIcon fontSize="small" className="icon" style={{ color: '#21b214' }} />
            </>
          ) : (
            <>
              USB Not Connected
              <CancelIcon
                fontSize="small"
                className="icon"
                color="secondary"
                style={{ height: '100%' }}
              />
            </>
          )}
      </div>

      <div style={{ padding: '10px' }}>
        <Button variant="contained" onClick={handleConnect} size="small"> Connect </Button>
      </div>

      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button className={classes.transparentBtn} onClick={() => setAndCheckFreq(freq - 5)}>
            <img src={icons.decrease.icon} alt="Decrease" />
          </Button>
          <input
            id="tf-frequency"
            onChange={(e) => { setFreq(parseInt(e.target.value, 10)); }}
            type="number"
            value={freq}
            onBlur={() => { if (freq > 10000 || freq < 0) { setFreq(0); } }}
            style={{ border: '2px solid #D4A373', borderRadius: '3px' }}
          />
          <Button className={classes.transparentBtn} onClick={() => setAndCheckFreq(freq + 5)}>
            <img src={icons.increase.icon} alt="Increase" />
          </Button>
        </ButtonGroup>
        <div className="unit"> Hz </div>
      </div>

      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button className={classes.transparentBtn} onClick={() => setAndCheckVolt(volt - 5)}>
            <img src={icons.decrease.icon} alt="Decrease" />
          </Button>
          <input
            id="tf-voltage"
            onChange={(e) => { setVolt(parseInt(e.target.value, 10)); }}
            type="number"
            value={volt}
            onBlur={() => { if (volt > 180 || volt < 0) { setVolt(0); } }}
          />
          <Button className={classes.transparentBtn} onClick={() => setAndCheckVolt(volt + 5)}>
            <img src={icons.increase.icon} alt="Increase" />
          </Button>
        </ButtonGroup>
        <div className="unit"> V </div>
      </div>

      <div />

      <div style={{ paddingLeft: '10px', paddingTop: '140px' }}>
        <Button
          size="small"
          onClick={setZero}
          variant="contained"
          className={usbConnected && volt ? classes.brownBtn : classes.grayBtn}
        >
          Set voltage to 0 V
        </Button>
      </div>

      <div style={{ padding: '10px' }}>
        <Button size="small" variant="contained" onClick={test}>Test</Button>
      </div>

      <div className="rButton">
        <Button
          size="small"
          onClick={setVpp}
          variant="contained"
          className={usbConnected ? classes.brownBtn : classes.grayBtn}
        >
          Set Vpp
        </Button>
      </div>

    </div>
  );
}
