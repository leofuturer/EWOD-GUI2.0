var myDevice;
var view = new Uint8Array(64);

const filters = [
  {
    vendorId: 1155,
    productId: 22352
  }
];

export function initiateConnection()
{
  console.log("Initiating USB Communication");
  getDevices()
}

async function getDevices()
{
  //const device = navigator.hid.requestDevice({ filters });
  const devices = await navigator.hid.getDevices();
  myDevice = await devices[0];
  console.log(myDevice)
  await myDevice.open();

  myDevice.addEventListener("inputreport", event => {
    const { data, device, reportId } = event;
    if (device.productId !== filters[0].productId) return;
    handleData(data);
  });

  //setInterval(sendAck, 1000);
}

function handleData(data)
{
  const view = new Uint32Array(data.buffer);
  if(view[0] !== 0xBB) return; //0xBB needed to determine validity of data receivecd
  var voltage = view[1] * 0.1
  var current = view[2] * 0.1

  console.log(voltage + "V " + current + "mA")
}

async function sendAck()
{
  view[0] = 0xAB;
  const send = new ArrayBuffer(view);
  await myDevice.sendReport(0x00, view);
}
