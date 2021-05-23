import React, { useContext } from 'react';
import ListItem from '@material-ui/core/ListItem';
import Tooltip from '@material-ui/core/Tooltip';
import { FileCopy } from '@material-ui/icons';
import { CanvasContext } from '../Contexts/CanvasProvider';

export default function UploadButton() {
  const context = useContext(CanvasContext);
  const { squares, setElectrodes, setSelected } = context;
  const { electrodes } = squares;
  const filePicker = document.getElementById('filePicker');
  async function getFileLegacy() {
    return new Promise((resolve, reject) => {
      filePicker.onchange = () => {
        const file = filePicker.files[0];
        if (file) {
          resolve(file);
          return;
        }
        reject(new Error('AbortError'));
      };
      filePicker.click();
    });
  }

  async function readFile(file) {
    if (file.text) {
      return file.text();
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        const text = e.srcElement.result;
        resolve(text);
      });
      reader.readAsText(file);
    });
  }

  async function openFilePicker() {
    try {
      let file;
      if ('showOpenFilePicker' in window) {
        const filehandle = await window.showOpenFilePicker();
        if (!filehandle) return;
        file = await filehandle[0].getFile();
      } else {
        file = await getFileLegacy();
      }
      if (file.name.slice(-4) !== 'ewds') window.alert('You can only upload .ewds files');
      else {
        const content = await readFile(file);
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
        // TODO: Parse Actuation Sequence Info as well.
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
    <Tooltip title="Upload">
      <ListItem button onClick={handleImport}>
        <FileCopy />
      </ListItem>
    </Tooltip>
  );
}
