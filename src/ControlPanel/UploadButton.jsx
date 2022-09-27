/* eslint-disable prefer-destructuring */
import React, { useContext } from 'react';
import ListItem from '@material-ui/core/ListItem';
import Tooltip from '@material-ui/core/Tooltip';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import { GeneralContext } from '../Contexts/GeneralProvider';
import ActuationSequence from '../Actuation/Actuation';
import icons from '../Icons/icons';
import { ELEC_SIZE } from '../constants';

export default function UploadButton() {
  const context = useContext(CanvasContext);
  const actuation = useContext(ActuationContext);
  const { setElecToPin, setPinToElec } = useContext(GeneralContext);
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
      if (file.name.slice(-3) === 'ecc') {
        const fileContent = await readFile(file);
        const line = fileContent.split('\n');

        const newElectrodes = [];
        const newAllCombined = [];
        const newElecToPin = {};
        const newPinToElec = {};
        for (let i = 0; i < line.length - 1; i += 1) {
          const split = line[i].split(' M ');
          const content = split[0].split(' ');
          const shape = split[1];
          const basicShape = '0 0 L 1 0 L 1 1 L 0 1 Z';
          if (shape === basicShape) {
            const temp = {};
            temp.initPositions = [
              parseInt(content[0], 10) * ELEC_SIZE,
              parseInt(content[1], 10) * ELEC_SIZE,
            ];
            temp.deltas = [0, 0];
            temp.ids = i;
            newElectrodes.push(temp);
            newElecToPin[`S${i}`] = content[2];
            newPinToElec[content[2]] = `S${i}`;
          } else {
            const shapeContent = shape.split(' ');
            let xMax = parseInt(shapeContent[0], 10);
            let yMax = parseInt(shapeContent[1], 10);
            for (let j = 3; j < shapeContent.length; j += 3) {
              if (parseInt(shapeContent[j], 10) > xMax) {
                xMax = parseInt(shapeContent[j], 10);
              }
              if (parseInt(shapeContent[j + 1], 10) > yMax) {
                yMax = parseInt(shapeContent[j + 1], 10);
              }
            }

            const electrodeShape = [];
            for (let j = 0; j < yMax; j += 1) {
              const row = [];
              for (let k = 0; k < xMax; k += 1) {
                row.push(0);
              }
              electrodeShape.push(row);
            }

            for (let j = 3; j < shapeContent.length; j += 3) {
              const x = parseInt(shapeContent[j], 10) - parseInt(shapeContent[j - 3], 10);
              const y = parseInt(shapeContent[j + 1], 10) - parseInt(shapeContent[j - 2], 10);
              if (x === 0) {
                if (y > 0) {
                  for (let k = 0; k < y; k += 1) {
                    electrodeShape[parseInt(shapeContent[j - 2], 10) + k][
                      parseInt(shapeContent[j - 3], 10) - 1] += 1;
                  }
                } else {
                  for (let k = 0; k > y; k -= 1) {
                    electrodeShape[parseInt(shapeContent[j - 2], 10) + k - 1][
                      parseInt(shapeContent[j - 3], 10)] += 1;
                  }
                }
              } else if (x > 0) {
                for (let k = 0; k < x; k += 1) {
                  electrodeShape[parseInt(shapeContent[j - 2], 10)][
                    parseInt(shapeContent[j - 3], 10) + k] += 1;
                }
              } else {
                for (let k = 0; k > x; k -= 1) {
                  electrodeShape[parseInt(shapeContent[j - 2], 10) - 1][
                    parseInt(shapeContent[j - 3], 10) + k - 1] += 1;
                }
              }
            }

            for (let j = 0; j < yMax; j += 1) {
              for (let k = 0; k < xMax; k += 1) {
                if (electrodeShape[j][k]) {
                  newAllCombined.push([
                    (parseInt(content[0], 10) + k) * ELEC_SIZE,
                    (parseInt(content[1], 10) + j) * ELEC_SIZE,
                    i,
                  ]);
                }
              }
            }
            for (let j = 1; j < yMax - 1; j += 1) {
              const countOne = electrodeShape[j].filter((x) => x === 1).length;
              const countTwo = electrodeShape[j].filter((x) => x === 2).length;
              if (countOne) {
                if (countOne % 2 === 0) {
                  let lastX = 0;
                  for (let oneIndex = 0; oneIndex < countOne; oneIndex += 2) {
                    const firstX = electrodeShape[j].indexOf(1, lastX);
                    const secondX = electrodeShape[j].indexOf(1, firstX + 1);
                    for (let k = firstX + 1; k < secondX; k += 1) {
                      newAllCombined.push([
                        (parseInt(content[0], 10) + k) * ELEC_SIZE,
                        (parseInt(content[1], 10) + j) * ELEC_SIZE,
                        i,
                      ]);
                    }
                    lastX = firstX + 1;
                  }
                } else if (countOne === 1) {
                  const firstX = electrodeShape[j].indexOf(1);
                  for (let k = firstX + 1; k < xMax; k += 1) {
                    if (electrodeShape[j][k] === 2) {
                      for (let h = firstX + 1; h < k; h += 1) {
                        newAllCombined.push([
                          (parseInt(content[0], 10) + h) * ELEC_SIZE,
                          (parseInt(content[1], 10) + j) * ELEC_SIZE,
                          i,
                        ]);
                      }
                      break;
                    }
                  }
                  for (let k = firstX - 1; k >= 0; k -= 1) {
                    if (electrodeShape[j][k] === 2) {
                      for (let h = firstX - 1; h > k; h -= 1) {
                        newAllCombined.push([
                          (parseInt(content[0], 10) + h) * ELEC_SIZE,
                          (parseInt(content[1], 10) + j) * ELEC_SIZE,
                          i,
                        ]);
                      }
                      break;
                    }
                  }
                } else {
                  let firstX = electrodeShape[j].indexOf(1);
                  let secondX = electrodeShape[j].indexOf(1, firstX + 1);
                  for (let oneIndex = 0; oneIndex < countOne - 1; oneIndex += 1) {
                    let allZero = true;
                    for (let k = firstX + 1; k < secondX; k += 1) {
                      if (electrodeShape[j][k]) {
                        allZero = false;
                        break;
                      }
                    }
                    if (allZero) {
                      for (let k = firstX + 1; k < secondX; k += 1) {
                        newAllCombined.push([
                          (parseInt(content[0], 10) + k) * ELEC_SIZE,
                          (parseInt(content[1], 10) + j) * ELEC_SIZE,
                          i,
                        ]);
                      }
                    }
                    firstX = secondX;
                    secondX = electrodeShape[j].indexOf(1, firstX + 1);
                  }
                }
              }
              if (countTwo > 1) {
                let firstX = electrodeShape[j].indexOf(2);
                let secondX = electrodeShape[j].indexOf(2, firstX + 1);
                for (let twoIndex = 0; twoIndex < countTwo - 1; twoIndex += 1) {
                  if (electrodeShape[j - 1][firstX] === 1 || electrodeShape[j + 1][firstX] === 1) {
                    let allZero = true;
                    for (let k = firstX + 1; k < secondX; k += 1) {
                      if (electrodeShape[j][k]
                        || (electrodeShape[j - 1][k] < 2 && electrodeShape[j + 1][k] < 2)) {
                        allZero = false;
                        break;
                      }
                    }
                    if (allZero) {
                      for (let k = firstX + 1; k < secondX; k += 1) {
                        newAllCombined.push([
                          (parseInt(content[0], 10) + k) * ELEC_SIZE,
                          (parseInt(content[1], 10) + j) * ELEC_SIZE,
                          i,
                        ]);
                      }
                    }
                  }
                  firstX = secondX;
                  secondX = electrodeShape[j].indexOf(2, firstX + 1);
                }
              }
            }
            newElecToPin[`C${i}`] = content[2];
            newPinToElec[content[2]] = `C${i}`;
          }
        }
        setElecToPin(newElecToPin);
        setPinToElec(newPinToElec);
        setSelected([]);
        setElectrodes(newElectrodes);
        setComboLayout(newAllCombined);
      } else if (file.name.slice(-4) === 'ewds') {
        const content = await readFile(file);
        const newElectrodes = [];
        const newAllCombined = [];
        const newPinActuate = new Map();
        const newElecToPin = {};
        const newPinToElec = {};
        let newSimpleNum = 1;
        const stringList = content.split('\n');
        for (let i = 0; i < stringList.length; i += 1) {
          const e = stringList[i];
          if (e !== '') {
            const words = e.split(' ');
            if (
              words.length >= 3
              && words[0] === 'square'
              && !Number.isNaN(words[1])
              && !Number.isNaN(words[2])
            ) {
              const temp = {};
              temp.initPositions = [
                parseInt(words[1], 10),
                parseInt(words[2], 10),
              ];
              temp.deltas = [0, 0];
              temp.ids = i;
              newElectrodes.push(temp);
              if (words.length > 3) {
                newElecToPin[`S${i}`] = words[3];
                newPinToElec[words[3]] = `S${i}`;
              }
            } else if (
              words.length >= 4
              && words[0] === 'combine'
              && !Number.isNaN(words[1])
              && !Number.isNaN(words[2])
              && !Number.isNaN(words[1])
            ) {
              newAllCombined.push([
                parseInt(words[1], 10),
                parseInt(words[2], 10),
                parseInt(words[3], 10),
              ]);
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
              newSimpleNum = Math.max(ord, newSimpleNum);
              const newSeq = new ActuationSequence(id, 'simple', ord);
              newSeq.duration = dur;
              const set = new Set(sect[0].split(':')[1].split(','));
              newSeq.content = set;
              newPinActuate.set(id, newSeq);
              if (sect.length === 2) {
                if (!newPinActuate.has(+sect[1].split(':')[0])) {
                  const newLoop = new ActuationSequence(
                    +sect[1].split(':')[0],
                    'loop',
                  );
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
        setPinActuation(newPinActuate);
        setSimpleNum(newSimpleNum + 1);
      } else {
        window.alert('You can only upload .ecc or .ewds files');
      }
    } catch (e) {
      console.log(e);
    }
  }

  function handleImport() {
    if (electrodes.length > 0) {
      const changeCanvas = window.confirm(
        'Are you sure you want to replace your current canvas?',
      );
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
