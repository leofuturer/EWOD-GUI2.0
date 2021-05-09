import React, { useContext } from 'react';
import ListItem from '@material-ui/core/ListItem';
import Tooltip from '@material-ui/core/Tooltip';
import genFileContents from './genFileContents';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';
import icons from '../Icons/icons';

export default function DownloadButton() {
  const canvasContext = useContext(CanvasContext);
  const actuationContext = useContext(ActuationContext);
  const { electrodes } = canvasContext.squares;
  const { allCombined } = canvasContext.combined;
  const { pinActuate } = actuationContext.actuation;
  const aDownloadFile = document.getElementById('aDownloadFile');
  async function getNewFileHandle() {
    const options = {
      types: [
        {
          description: 'Ewds Files',
          accept: {
            '*/plain': ['.ewds'],
          },
        },
      ],
      excludeAcceptAllOption: true,
    };
    const handle = await window.showSaveFilePicker(options);
    return handle;
  }

  async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
  }
  async function handleDownload() {
    const contents = genFileContents(electrodes, allCombined, pinActuate);
    const fileText = `${contents.squares.join('\n')}\n${contents.combs.join('\n')
    }\n#ENDOFELECTRODE#\n${contents.actuation.join('\n')}\n#ENDOFSEQUENCE#\n`;
    if ('showSaveFilePicker' in window) {
      const handle = await getNewFileHandle();
      writeFile(handle, fileText);
    } else {
      const fileName = 'untitled.ewds';
      const opt = {
        types: [
          {
            description: 'Ewds Files',
            accept: {
              '*/plain': ['.ewds'],
            },
          },
        ],
      };
      const file = new File([fileText], '', opt);
      aDownloadFile.href = window.URL.createObjectURL(file);
      aDownloadFile.setAttribute('download', fileName);
      aDownloadFile.click();
    }
  }

  return (
    <Tooltip title="Download">
      <ListItem button onClick={handleDownload}>
        <img src={icons.downloadfile.icon} alt="Download File" />
      </ListItem>
    </Tooltip>
  );
}
