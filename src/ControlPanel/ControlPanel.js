import React, { useContext } from "react"
import Context from "../context"

export function ControlPanel() {
    const context = useContext(Context);
    const { drawing } = context.state
    const { setDrawing, setSelected, setStartActuate } = context

    function toggleDraw(e) {
        setSelected([])
        setDrawing(!drawing)
    }

    return (
        <React.Fragment>
            <button onClick={toggleDraw}>Draw</button>
            <button onClick={() => setStartActuate()}>Actuate</button>
        </React.Fragment>
    )
}