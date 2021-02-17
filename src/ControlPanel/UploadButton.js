import React, { useContext } from "react"
import Context from "../context"

export function UploadButton() {
    const context = useContext(Context);
    const { electrodes } = context.state
    const { setDrawing, setElectrodes, setSelected } = context
    async function openFilePicker() {
        let filehandle;
        await window.showOpenFilePicker()
            .then((res) => [filehandle] = res)
            .catch((err) => console.error(err))

        if (filehandle === undefined)
            return

        const file = await filehandle.getFile();
        if (file.name.slice(-4) !== ".ewd") window.alert("You can only upload .ewd files")
        else {
            const content = await file.text();

            let newInitPositions = []
            let newDeltas = []
            let string_list = content.split('\n');
            for (var i = 0; i < string_list.length; i++) {
                let e = string_list[i]
                if (e === "") continue
                let words = e.split(" ")
                if (words.length >= 3 && words[0] === "square" && !isNaN(words[1]) && !isNaN(words[2])) {
                    newInitPositions.push([parseInt(words[1]), parseInt(words[2])])
                    newDeltas.push([0, 0])
                } else if (e.charAt(0) === '#') {
                    // line starts with #
                } else if (!isNaN(e.charAt(0))) {
                    // line starts with number
                }
                else {
                    window.alert("Your file's contents are a bit funny")
                    return
                }
            }

            setSelected([])
            setElectrodes({ initPositions: newInitPositions, deltas: newDeltas })
            setDrawing(false)
        }
    }

    function handleImport() {
        if (electrodes.initPositions.length > 0) {
            let changeCanvas = window.confirm('Are you sure you want to replace your current canvas?');
            if (changeCanvas) openFilePicker()
        } else openFilePicker()
    }

    return (
        <button onClick={handleImport}>Upload</button>
    )
}