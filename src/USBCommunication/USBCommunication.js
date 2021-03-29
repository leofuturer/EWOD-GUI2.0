/*==Globals=========================================================*/

var EWODDevice;
var view = new Uint8Array(64); //Stores pin states

const filters = [
  {
    vendorId: 1155,
    productId: 22352
  }
];

/*==Exports=========================================================*/

// Initate Connection with EWOD device ... onRecvData(voltage, current) is
// called when data from EWOD is received
export async function initiateConnection(onRecvData)
{
  console.log("Initiating USB Communication");
  await getDevices(onRecvData)
}

// Returns true if the EWOD is connected
export function isDeviceConnected()
{
  if(EWODDevice && EWODDevice.opened)
    return true;
  else
    return false;
}

//Set a list of pins to a given value (value is either 0 or 1)
//ex. setPin([9,10], 1) sets pins 9 and 10 to high
export async function setPin(pins, value)
{
  if(value != 0 || value != 1)
  {
    console.log("Pin values must be 0 or 1")
    return;
  }

  for(var i in pins)
  {
    if(pins[i] < 9 || pins[i] > 256)
    {
      console.log("Pin out of range");
      return;
    }

    console.log("Pin " + pins[i] + " set to " + value);

    if(value)
      view[5 + Math.floor((pins[i] - 9) / 8)] |= (1 << ((pins[i]-9) % 8));
    else
      view[5 + Math.floor((pins[i] - 9) / 8)] &= ~(1 << ((pins[i]-9) % 8));
  }

  view[0] = 0xAA;

  const send = new ArrayBuffer(view);
  await EWODDevice.sendReport(0x00, view);
}

//sets EWOD's voltage
export async function setV(voltage)
{
  view[0] = 0xAA;
  view[40] = voltage;
  const send = new ArrayBuffer(view);
  await EWODDevice.sendReport(0x00, view);
  setInterval(sendAck, 1000);
}

/*=Internal============================================================*/

async function getDevices(onRecvData)
{
  const devices = await navigator.hid.getDevices();
  EWODDevice = await devices[0];

  if(!EWODDevice)
  {
    console.log("No suitable devices found")
    return;
  }

  try
  {
    await EWODDevice.open();
  }

  catch (e)
  {
    console.log(e);
    return;
  }

  EWODDevice.addEventListener("inputreport", event => {
    const { data, device, reportId } = event;
    if (device.productId !== filters[0].productId) return;
    handleData(data, onRecvData);
  });
}

function handleData(data, onRecvData)
{
  const view = new Uint32Array(data.buffer);
  if(view[0] !== 0xBB) return; //0xBB needed to determine validity of data receivecd
  var voltage = view[1] * 0.1
  var current = view[2] * 0.1

  onRecvData(voltage, current);
}

async function sendAck()
{
  view[0] = 0xAB;
  const send = new ArrayBuffer(view);
  await EWODDevice.sendReport(0x00, view);
}
