/* eslint-disable no-bitwise */

// Globals
let EWODDevice;
const EWODDeviceView = new Uint8Array(64); // Stores pin states

function getFilter() {
  console.log('getting filter');
  let product = parseInt(localStorage.getItem('deviceId'), 10);
  if (!product) product = 22353;
  return { vendorId: 1155, productId: product };
}

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
  const filter = getFilter();
  if (devices.length === 0) {
    // requestDevice will open a pop up for the user to give permission for
    await navigator.hid.requestDevice({ filters: [filter] });
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
    if (device.productId !== filter.productId) return;
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
export async function setPin(pins, value, reset = false, ack = true) {
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

  const filter = getFilter();
  EWODDeviceView[0] = 0xAA;
  if (filter.productId === 22353 && ack) EWODDeviceView[0] = 0xAC;

  await EWODDevice.sendReport(0x00, EWODDeviceView);
}

// Sets EWOD's voltage
export async function setV(voltage, ack = true) {
  const filter = getFilter();
  if (!EWODDevice) {
    console.log('Device not connected');
    return;
  }

  EWODDeviceView[0] = 0xAA;
  EWODDeviceView[40] = voltage;
  if (filter.productId === 22353) {
    const msb = (voltage * 100) >> 8; // The highest bit is always 0 (max freq 10000 Hz)
    const lsb = (voltage * 100) & 0xFF;
    EWODDeviceView[40] = lsb;
    EWODDeviceView[41] = msb;
    if (ack) EWODDeviceView[0] = 0xAC;
  }
  console.log(EWODDeviceView);
  console.log(EWODDevice);
  await EWODDevice.sendReport(0x00, EWODDeviceView);
  setInterval(sendAck, 1000);
}

// Sets EWOD's frequency
export async function setF(frequency, ack = true) {
  const msb = frequency >> 8; // The highest bit is always 0 (max freq 10000 Hz)
  const lsb = frequency & 0xFF;

  const filter = getFilter();

  EWODDeviceView[0] = 0xAA;
  if (filter.productId === 22353 && ack) EWODDeviceView[0] = 0xAC;
  EWODDeviceView[36] = lsb;
  EWODDeviceView[37] = msb;

  await EWODDevice.sendReport(0x00, EWODDeviceView);
  setInterval(sendAck, 1000);
}
