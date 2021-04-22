// label: pin97 -- <INPUT_ELECTRODE_COORDINATE>

import React, { useContext } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { GeneralContext } from '../Contexts/GeneralProvider';

export default function Pins() {
  const firstRow = [97, 98, 99, 100, 101, 102];
  const secondRow = [96, 95, 94, 93, 92, 91];

  const {
    pinToCoord, coordToPin, setPinMap, setCoordMap, indToPin, pinToInd,
  } = useContext(GeneralContext);

  function handlePinSet(e) { // expect input of form NUM1,NUM2
    e.preventDefault();
    const labelElem = e.target.childNodes[0];
    const pinId = labelElem.innerText;
    const coord = labelElem.childNodes[1].value;

    if (pinToCoord.has(pinId)) coordToPin.delete(pinToCoord.get(pinId));

    setPinMap(pinToCoord.set(pinId, coord));
    setCoordMap(coordToPin.set(coord, pinId));
  }

  function test() {
    console.log(pinToCoord);
    console.log(coordToPin);
    console.log(indToPin);
    console.log(pinToInd);
  }

  return (
    <Grid container spacing={2} style={{ backgroundColor: '#FEFAE3', marginLeft: 49 }}>
      {
        firstRow.map((pinNum, ind) => {
          const id = `pin${pinNum}`;
          return (
            <Grid item xs={2} key={ind.id}>
              <form onSubmit={handlePinSet}>
                <label htmlFor={id}>
                  {pinNum}
                  <input type="text" name={id} id={id} />
                </label>
                <button type="submit">O</button>
              </form>
            </Grid>
          );
        })
      }
      {
        secondRow.map((pinNum, ind) => {
          const id = `pin${pinNum}`;
          return (
            <Grid item xs={2} key={ind.id}>
              <label htmlFor={id}>
                {pinNum}
                <input type="text" name={id} id={id} />
              </label>
              <button type="submit">O</button>
            </Grid>
          );
        })
      }
      <Button onClick={test}>Console Log Maps</Button>
    </Grid>
  );
}
