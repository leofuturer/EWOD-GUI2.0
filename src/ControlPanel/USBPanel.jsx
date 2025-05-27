import React, { useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { makeStyles } from '@material-ui/styles';
import { DeviceContext } from '../Contexts/DeviceProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import icons from '../Icons/icons';

import './USBPanel.css';
// removed setPin from imports.
import {
  setV, setF, isDeviceConnected,
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
  text: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '12px',
    fontSize: '12px',
    color: '#A06933',
  },
});

export default function USBPanel({ usbConnected }) {
  const { id, setId } = useContext(DeviceContext);
  const actuationContext = useContext(ActuationContext);
  const voltageBounds = [{ hi: 180, lo: 40 }, { hi: 5.5, lo: 1 }];
  const classes = useStyles();
  const {
    setPinToElec, setElecToPin,
  } = React.useContext(GeneralContext);
  const [volt, setVolt] = useState(0);
  const [freq, setFreq] = useState(0);

  function setAndCheckVolt(v) {
    const index = id - 22352;
    if (v <= voltageBounds[index].hi && v >= voltageBounds[index].hi) {
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
      setVolt(0);
      setFreq(0);
    }
  }
  function setVpp() {
    if (isDeviceConnected()) {
      setV(volt);
      setF(freq);
    }
  }

  const [selectedVoltage, setSelectedVoltage] = useState(parseInt(localStorage.getItem('deviceId'), 10) === 22353 ? 'lo' : 'hi');
  const handleChange = (event) => {
    const deviceId = event.target.value === 'lo' ? 22353 : 22352;
    setSelectedVoltage(event.target.value);
    setId(deviceId);
    actuationContext.clearAll();
    setPinToElec({});
    setElecToPin({});
  };

  // function test() {
  //   if (isDeviceConnected()) {
  //     setPin([9, 10, 11, 12, 13], 1);
  //   }
  // }
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
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: '85px',
        paddingLeft: '45px',
      }}
      >
        <div className={classes.text}>0</div>
        <div className={classes.text}>10000</div>
      </div>

      <div>
        <ButtonGroup size="small" style={{ width: '170px', float: 'left' }} className="inputCounters">
          <Button
            className={classes.transparentBtn}
            onClick={() => setAndCheckVolt(id === 22353 ? volt - 0.5 : volt - 5)}
          >
            <img src={icons.decrease.icon} alt="Decrease" />
          </Button>
          <input
            id="tf-voltage"
            onChange={(e) => { setVolt(parseInt(e.target.value, 10)); }}
            type="number"
            value={volt}
            onBlur={() => {
              const index = id - 22352;
              if (volt > voltageBounds[index].hi) {
                setVolt(voltageBounds[index].hi);
              } else if (volt < voltageBounds[index].lo) {
                setVolt(voltageBounds[index].lo);
              }
            }}
          />
          <Button
            className={classes.transparentBtn}
            onClick={() => setAndCheckVolt(id === 22353 ? volt - 0.5 : volt - 5)}
          >
            <img src={icons.increase.icon} alt="Increase" />
          </Button>
        </ButtonGroup>
        <div className="unit"> V </div>
      </div>
      <div />
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: '90px',
        paddingLeft: '45px',
      }}
      >
        <div className={classes.text}>{ id === 22353 ? 1 : 0 }</div>
        <div className={classes.text}>{ id === 22353 ? 5.5 : 180 }</div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingRight: '45px',
        paddingTop: '10px',
      }}
      >
        <img src={icons.voltagewarning.icon} alt="Voltage Warning" />

      </div>
      <div className="rButton" style={{ marginTop: 10 }}>
        <Button
          size="small"
          // eslint-disable-next-line react/jsx-no-bind
          onClick={setZero}
          variant="contained"
          className={usbConnected && volt ? classes.brownBtn : classes.grayBtn}
        >
          Set voltage to 0 V
        </Button>
      </div>
      <div className="rButton">
        <Button
          // eslint-disable-next-line react/jsx-no-bind
          size="small"
          // eslint-disable-next-line react/jsx-no-bind
          onClick={setVpp}
          variant="contained"
          className={usbConnected ? classes.brownBtn : classes.grayBtn}
          style={{ paddingLeft: 30, paddingRight: 30 }}
        >
          Set Vpp
        </Button>
      </div>
      <div
        style={{
          display: 'flex', justifyContent: 'flex-end', paddingRight: '10px', paddingBottom: '10px',
        }}
      >
        <select
          value={selectedVoltage}
          onChange={handleChange}
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
          }}
        >
          <option value="lo">Low Voltage</option>
          <option value="hi">High Voltage</option>
        </select>
      </div>
    </div>
  );
}
