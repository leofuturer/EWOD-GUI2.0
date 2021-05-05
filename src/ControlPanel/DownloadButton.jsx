import React, { useContext } from 'react';
import ListItem from '@material-ui/core/ListItem';
import { GetApp } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import genFileContents from './genFileContents';
import { CanvasContext } from '../Contexts/CanvasProvider';
import { ActuationContext } from '../Contexts/ActuationProvider';

export default function DownloadButton() {
  const canvasContext = useContext(CanvasContext);
  const actuationContext = useContext(ActuationContext);
  const { electrodes } = canvasContext.squares;
  const { allCombined } = canvasContext.combined;
  const { pinActuate } = actuationContext.actuation;
  async function getNewFileHandle() {
    const options = {
      types: [
        {
          description: 'Ewd Files',
          accept: {
            '*/plain': ['.ewd'],
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
    const handle = await getNewFileHandle();
    const contents = genFileContents(electrodes, allCombined, pinActuate);
    const fileText = `${contents.squares.join('\n')}\n${contents.combs.join('\n')
    }\n#ENDOFELECTRODE#\n${contents.actuation.join('\n')}\n#ENDOFSEQUENCE#\n`;
    writeFile(handle, fileText);
  }

  return (
    <Tooltip title="Download">
      <ListItem button onClick={handleDownload}>
        <GetApp />
      </ListItem>
    </Tooltip>
  );
}
