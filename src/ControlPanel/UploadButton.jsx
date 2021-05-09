import React, { useContext } from 'react';
import ListItem from '@material-ui/core/ListItem';
import Tooltip from '@material-ui/core/Tooltip';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import ActuationSequence from '../Actuation/Actuation';
import icons from '../Icons/icons';

export default function UploadButton() {
  const context = useContext(CanvasContext);
  const actuation = useContext(ActuationContext);
  const {
    squares, setElectrodes, setSelected, setComboLayout,
  } = context;
  const { electrodes } = squares;
  const { setPinActuation, setSimpleNum } = actuation;
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
        const newAllCombined = [];
        const newPinActuate = new Map();
        let newSimpleNum = 1;
        const stringList = content.split('\n');
        for (let i = 0; i < stringList.length; i += 1) {
          const e = stringList[i];
          if (e !== '') {
            const words = e.split(' ');
            if (words.length >= 3 && words[0] === 'square' && !Number.isNaN(words[1]) && !Number.isNaN(words[2])) {
              newInitPositions.push([parseInt(words[1], 10), parseInt(words[2], 10)]);
              newDeltas.push([0, 0]);
            } else if (words.length >= 4 && words[0] === 'combine' && !Number.isNaN(words[1]) && !Number.isNaN(words[2]) && !Number.isNaN(words[1])) {
              newAllCombined.push([parseInt(words[1], 10),
                parseInt(words[2], 10), parseInt(words[3], 10)]);
            } else if (e.charAt(0) === '#') {
            // line starts with #
            } else if (!Number.isNaN(e.charAt(0))) {
              const sect = e.split(';');
              if (sect.length > 2) {
                window.alert("Your file's contents are a bit funny");
              }
              const id = parseInt(sect[0].split(':')[0], 10);
              const dur = parseInt(sect[0].split(':')[2], 10);
              const ord = parseInt(sect[0].split(':')[3], 10);
              newSimpleNum = Math.max(ord, newSimpleNum);
              const newSeq = new ActuationSequence(id, 'simple', ord);
              newSeq.duration = dur;
              const set = new Set(sect[0].split(':')[1].split(','));
              newSeq.content = set;
              newPinActuate.set(id, newSeq);
              if (sect.length === 2) {
                if (!newPinActuate.has(+sect[1].split(':')[0])) {
                  const newLoop = new ActuationSequence(+sect[1].split(':')[0], 'loop');
                  newLoop.repTime = +sect[1].split(':')[1];
                  newPinActuate.set(+sect[1].split(':')[0], newLoop);
                }
                newPinActuate.get(+sect[1].split(':')[0]).content.push(id);
                newPinActuate.get(id).parent = +sect[1].split(':')[0];
              }
              console.log(newPinActuate);
            } else {
              window.alert("Your file's contents are a bit funny");
              return;
            }
          }
        }

        setSelected([]);
        setElectrodes({ initPositions: newInitPositions, deltas: newDeltas });
        setComboLayout(newAllCombined);
        setPinActuation(newPinActuate);
        setSimpleNum(newSimpleNum + 1);
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
        <img src={icons.import.icon} alt="Import File" />
      </ListItem>
    </Tooltip>
  );
}
