import React from 'react';
import range from './range';
import useMap from './useMap';
import './Pins.css';

export default function PinsTop() {
  const [pin, setPin] = React.useState(null);
  useMap(() => {
    setPin(null);
  }, pin);

  return (
    <>
      <div className="row">
        {
          range(97, 128).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(96, 65).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div className="row">
        {
          range(225, 256).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div className="row" style={{ marginBottom: 40 }}>
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(224, 218).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(217, 211).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(210, 204).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button className="pin ref" type="button" onClick={() => setPin('REF')}>REF</button>
        {
          range(203, 197).map((pinNum, ind) => <button className="pin" type="button" key={ind.id} onClick={(e) => setPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
