import React from 'react';
import range from './range';
import useMap from './useMap';

export default function PinsBottom() {
  const [pin, setPin] = React.useState(null);
  useMap(() => {
    setPin(null);
  }, pin);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(169, 175).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(176, 182).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(183, 189).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
        {
          range(190, 196).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setPin(null)}>REF</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(168, 137).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(41, 64).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        {
          range(129, 136).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(40, 9).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
