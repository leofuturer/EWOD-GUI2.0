import React, { useContext } from 'react';
import { GeneralContext } from '../Contexts/GeneralProvider';
import range from './range';

export default function PinsBottom() {
  const { setCurrPin } = useContext(GeneralContext);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(169, 175, 0).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button">REF</button>
        {
          range(176, 182, 0).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button">REF</button>
        {
          range(183, 189, 0).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button">REF</button>
        {
          range(190, 196, 0).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
        <button type="button">REF</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(168, 137, 1).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(41, 136, 0).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 49 }}>
        {
          range(40, 9, 1).map((pinNum, ind) => <button type="button" key={ind.id} onClick={(e) => setCurrPin(e.target.innerText)}>{pinNum}</button>)
        }
      </div>
    </>
  );
}
