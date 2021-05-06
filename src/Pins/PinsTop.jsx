import React, { useContext } from 'react';
import { GeneralContext } from '../Contexts/GeneralProvider';
import range from './range';

export default function PinsTop() {
  const { setCurrPin } = useContext(GeneralContext);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(97, 128).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(96, 65).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(225, 256).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        <button type="button" onClick={() => setCurrPin(null)}>REF</button>
        {
          range(224, 218).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setCurrPin(null)}>REF</button>
        {
          range(217, 211).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setCurrPin(null)}>REF</button>
        {
          range(210, 204).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button" onClick={() => setCurrPin(null)}>REF</button>
        {
          range(203, 197).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
