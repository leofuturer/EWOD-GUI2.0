import React, { useContext } from 'react';
import { CanvasContext } from '../Contexts/CanvasProvider';

export default function UploadButton() {
  const context = useContext(CanvasContext);
  const { electrodes } = context.state;
  const { setDrawing, setElectrodes, setSelected } = context;
  async function openFilePicker() {
    try {
      const filehandle = await window.showOpenFilePicker();
      if (filehandle === undefined) return;
      const file = await filehandle.getFile();
      if (file.name.slice(-4) !== '.ewd') window.alert('You can only upload .ewd files');
      else {
        const content = await file.text();

        const newInitPositions = [];
        const newDeltas = [];
        const stringList = content.split('\n');
        for (let i = 0; i < stringList.length; i += 1) {
          const e = stringList[i];
          if (e !== '') {
            const words = e.split(' ');
            if (words.length >= 3 && words[0] === 'square' && !Number.isNaN(words[1]) && !Number.isNaN(words[2])) {
              newInitPositions.push([parseInt(words[1], 10), parseInt(words[2], 10)]);
              newDeltas.push([0, 0]);
            } else if (e.charAt(0) === '#') {
              // line starts with #
            } else if (!Number.isNaN(e.charAt(0))) {
              // line starts with number
            } else {
              window.alert("Your file's contents are a bit funny");
              return;
            }
          }
        }

        setSelected([]);
        setElectrodes({ initPositions: newInitPositions, deltas: newDeltas });
        setDrawing(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  function handleImport() {
    if (electrodes.initPositions.length > 0) {
      const changeCanvas = window.confirm('Are you sure you want to replace your current canvas?');
      if (changeCanvas) openFilePicker();
    } else openFilePicker();
  }

  return (
    <button onClick={handleImport} type="button">Upload</button>
  );
}
