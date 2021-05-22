import React from 'react';
import range from './range';
import useMap from './useMap';

export default function PinsTop() {
  const [pin, setPin] = React.useState(null);
  useMap(() => {
    setPin(null);
  }, pin);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(97, 128).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(96, 65).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(225, 256).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(224, 218).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(217, 211).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(210, 204).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(203, 197).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
