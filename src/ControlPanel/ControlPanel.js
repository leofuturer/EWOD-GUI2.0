import React, { useContext } from "react"
import Context from "../context"
import SaveButton from "./SaveButton"
import { UploadButton } from "./UploadButton"
import { DownloadButton } from "./DownloadButton"

export function ControlPanel() {
    const context = useContext(Context);
    const { drawing } = context.state
    const { setDrawing, setSelected, setCombSelected } = context

    function toggleDraw() {
        setSelected([])
        setCombSelected([])
        setDrawing(!drawing)
    }

    return (
        <React.Fragment>
            <UploadButton />
            <button onClick={toggleDraw}>Draw</button>
            <SaveButton />
            <DownloadButton />
        </React.Fragment>
    )
}