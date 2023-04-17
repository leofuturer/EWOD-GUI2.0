/* eslint-disable prefer-destructuring */
import React, { useContext } from 'react';
import ListItem from '@material-ui/core/ListItem';
import Tooltip from '@material-ui/core/Tooltip';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import ActuationSequence from '../Actuation/Actuation';
import { setPin } from '../USBCommunication/USBCommunication';
import icons from '../Icons/icons';

export default function UploadButton() {
  const context = useContext(CanvasContext);
  const actuation = useContext(ActuationContext);
  const { setElecToPin, setPinToElec } = useContext(GeneralContext);
  const {
    squares, setElectrodes, setSelected, setComboLayout,
  } = context;
  const { electrodes } = squares;
  const { setPinActuation, setSimpleNum, setCurrentStep } = actuation;
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
        setPin([], 0, true);
        const content = await readFile(file);
        const newElectrodes = [];
        const newAllCombined = [];
        const newPinActuate = new Map();
        const newElecToPin = {};
        const newPinToElec = {};
        let currStep = 0;
        let newSimpleNum = 0;
        let prevOrd = Infinity;
        const stringList = content.split('\n');
        for (let i = 0; i < stringList.length; i += 1) {
          const e = stringList[i];
          if (e !== '') {
            const words = e.split(' ');
            if (words.length >= 3 && words[0] === 'square' && !Number.isNaN(words[1]) && !Number.isNaN(words[2])) {
              const temp = {};
              temp.initPositions = [parseInt(words[1], 10), parseInt(words[2], 10)];
              temp.deltas = [0, 0];
              temp.ids = i;
              newElectrodes.push(temp);
              if (words.length > 3) {
                newElecToPin[`S${i}`] = words[3];
                newPinToElec[words[3]] = `S${i}`;
              }
            } else if (words.length >= 4 && words[0] === 'combine' && !Number.isNaN(words[1]) && !Number.isNaN(words[2]) && !Number.isNaN(words[1])) {
              newAllCombined.push([parseInt(words[1], 10),
                parseInt(words[2], 10), parseInt(words[3], 10)]);
              if (words.length > 4) {
                newElecToPin[`C${words[3]}`] = words[4];
                newPinToElec[words[3]] = `C${i}`;
              }
            } else if (e.charAt(0) === '#') {
              // line starts with #
            } else if (!Number.isNaN(e.charAt(0))) {
              const sect = e.split(';');
              if (sect.length > 2) {
                window.alert("Your file's contents cannot be determined");
              }
              const id = parseInt(sect[0].split(':')[0], 10);
              const dur = parseInt(sect[0].split(':')[2], 10);
              const ord = parseInt(sect[0].split(':')[3], 10);
              if (ord < prevOrd) {
                currStep = id;
                prevOrd = ord;
              }
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
            } else {
              window.alert("Your file's contents cannot be determined");
              return;
            }
          }
        }
        setElecToPin(newElecToPin);
        setPinToElec(newPinToElec);
        setSelected([]);
        setElectrodes(newElectrodes);
        setComboLayout(newAllCombined);
        setCurrentStep(currStep);
        setPinActuation(newPinActuate);
        // simple num should be the maximum of all the orders, + 1.
        setSimpleNum(newSimpleNum + 1);
      }
    } catch (e) {
      console.log(e);
    }
  }

  function handleImport() {
    if (electrodes.length > 0) {
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
