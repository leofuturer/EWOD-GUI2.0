import React, { useContext } from "react"
import Context from "../context"
import { genFileContents } from "./genFileContents"

export function DownloadButton() {
    const { electrodes } = useContext(Context).state
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
            excludeAcceptAllOption: true
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
        const handle = await getNewFileHandle()
        const contents = genFileContents(electrodes)
        writeFile(handle, contents.join("\n"))
    }

    return (
        <button onClick={handleDownload}>Download</button>
    )
}