import React, { useContext } from "react"
import Context from "../context"
import { SaveButton } from "./SaveButton"

export function ControlPanel() {
    const context = useContext(Context);
    const { electrodes, drawing } = context.state
    const { setDrawing, setElectrodes, setSelected } = context

    function toggleDraw(e) {
        setSelected([])
        setDrawing(!drawing)
    }

    async function handleImport() {
        if (electrodes.initPositions.length > 0) {
            let changeCanvas = window.confirm('Are you sure you want to replace your current canvas?');
            if (changeCanvas) {
                let filehandle;
                await window.showOpenFilePicker()
                    .then((res) => [filehandle] = res)
                    .catch((err) => console.error(err))

                if (filehandle === undefined)
                    return

                const file = await filehandle.getFile();
                const content = await file.text();

                let newInitPositions = []
                let newDeltas = []
                let string_list = content.split('\n');
                string_list.forEach((e) => {
                    if (e.charAt(0) === 's' && e.charAt(1) === 'q') {
                        let mapping = e.split(' ')
                        newInitPositions.push([parseInt(mapping[1]), parseInt(mapping[2])])
                        newDeltas.push([0, 0])
                    }
                })

                setSelected([])
                setElectrodes({ initPositions: newInitPositions, deltas: newDeltas })
                setDrawing(false)
            }
        }
    }

    return (
        <React.Fragment>
            <button onClick={handleImport}>Upload</button>
            <button onClick={toggleDraw}>Draw</button>
            <SaveButton />
        </React.Fragment>
    )
}