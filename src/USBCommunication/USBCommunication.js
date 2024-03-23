/* eslint-disable linebreak-style */
/* eslint-disable no-bitwise */

// Globals
let EWODDevice;
const EWODDeviceView = new Uint8Array(64); // Stores pin states

const filters = [
  {
    vendorId: 1155,
    productId: 22352,
  },
];

// Internal

function handleData(data, onRecvData) {
  const TempEWODDeviceView = new Uint32Array(data.buffer);
  if (TempEWODDeviceView[0] !== 0xBB) return; // 0xBB needed to determine validity of data receivecd
  const voltage = TempEWODDeviceView[1] * 0.1;
  const current = TempEWODDeviceView[2] * 0.1;

  onRecvData(voltage, current);
}

// get device checks if there are any currently connected devices
// and if not, will open pop up for new devices.
async function getDevices(onRecvData) {
  let devices = await navigator.hid.getDevices();

  if (devices.length === 0) {
    // requestDevice will open a pop up for the user to give permission for
    await navigator.hid.requestDevice({ filters });
    devices = await navigator.hid.getDevices();
  }

  EWODDevice = await devices[0];

  if (!EWODDevice) {
    console.log('No suitable devices found');
    return;
  }

  try {
    await EWODDevice.open();
  } catch (e) {
    console.log(e);
    return;
  }

  EWODDevice.addEventListener('inputreport', (event) => {
    const { data, device } = event;
    if (device.productId !== filters[0].productId) return;
    handleData(data, onRecvData);
  });
}

async function sendAck() {
  EWODDeviceView[0] = 0xAB;
  await EWODDevice.sendReport(0x00, EWODDeviceView);
}

// Exports

// Initate Connection with EWOD device ... onRecvData(voltage, current) is
// called when data from EWOD is received
export async function initiateConnection(onRecvData) {
  console.log('Initiating USB Communication');
  await getDevices(onRecvData);
}

// Returns true if the EWOD is connected
export function isDeviceConnected() {
  if (EWODDevice && EWODDevice.opened) return true;
  return false;
}

// Set a list of pins to a given value (value is either 0 or 1)
//   ex. setPin([9,10], 1) sets pins 9 and 10 to high
export async function setPin(pins, value, reset = false) {
  if (!EWODDevice) {
    console.log('Device not connected');
    return;
  }

  if (value !== 0 && value !== 1) {
    console.log('Pin values must be 0 or 1');
    return;
  }

  const flag = pins.some((pin) => (pin < 9 || pin > 256));
  if (flag) {
    console.log('Pin out of range');
    return;
  }

  if (reset) {
    for (let i = 4; i < 36; i += 1) {
      EWODDeviceView[i] = 0;
    }
  }

  pins.forEach((pin) => {
    console.log(`Pin ${pin} set to ${value}`);
    const index = 5 + Math.floor((pin - 9) / 8);
    if (value) EWODDeviceView[index] |= (1 << ((pin - 9) % 8));
    else EWODDeviceView[index] &= ~(1 << ((pin - 9) % 8));
  });

  EWODDeviceView[0] = 0xAA;

  await EWODDevice.sendReport(0x00, EWODDeviceView);
}

// Sets EWOD's voltage
export async function setV(voltage) {
  if (!EWODDevice) {
    console.log('Device not connected');
    return;
  }

  EWODDeviceView[0] = 0xAA;
  EWODDeviceView[40] = voltage;
  await EWODDevice.sendReport(0x00, EWODDeviceView);
  setInterval(sendAck, 1000);
}

// Sets EWOD's frequency
export async function setF(frequency) {
  const msb = frequency >> 8; // The highest bit is always 0 (max freq 10000 Hz)
  const lsb = frequency & 0xFF;

  EWODDeviceView[0] = 0xAA;
  EWODDeviceView[36] = lsb;
  EWODDeviceView[37] = msb;

  await EWODDevice.sendReport(0x00, EWODDeviceView);
  setInterval(sendAck, 1000);
}
