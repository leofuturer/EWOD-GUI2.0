import React, { useEffect, useState, useCallback, useContext } from "react"
import DraggableItem from "./DraggableItem"

import Context from "../context"
import { ContextMenu } from "../ContextMenu"
import { elecSize } from "../constants"

export function Canvas() {
    const context = useContext(Context);
    const { electrodes, drawing, mouseDown, selected } = context.state
    const { setMouseDown, setDrawing, setElectrodes, setSelected } = context

    // sets mousedown status for selecting existing electrodes
    const handleMouseDown = useCallback((event) => {
        switch (event.which) {
            case 1: // left mouse button pressed
                setMouseDown(true)
                break;
            case 3: // right mouse button pressed
                break;
            default: // you're weird
                break;
        }
    }, [setMouseDown]);

    const handleMouseUp = useCallback(() => {
        setDrawing(false);
        setMouseDown(false)
    }, [setDrawing, setMouseDown])

    useEffect(() => {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp)
        };
    }, [handleMouseDown, handleMouseUp]);

    const handleMouseMove = useCallback((e) => {    // creating new electrode
        if (drawing && mouseDown) {
            let elecAtXY = false

            // electrode curr pos = init + deltas[idx]
            // wanna see if curr XY = electrodes[idx] + deltas[idx]
            const initPositions = electrodes.initPositions
            const deltas = electrodes.deltas
            const x = Math.floor(e.pageX / elecSize) * elecSize
            const y = Math.floor(e.pageY / elecSize) * elecSize
            for (var idx = 0; idx < deltas.length; idx++)
                // if an electrode already exists at this position
                if (x === initPositions[idx][0] + deltas[idx][0] && y === initPositions[idx][1] + deltas[idx][1]) {
                    elecAtXY = true
                    break
                }
            if (!elecAtXY) { // create new electrode
                setElectrodes({
                    initPositions: initPositions.concat([[x, y]]),
                    deltas: deltas.concat([[0, 0]])
                })
            }
        }
    }, [drawing, electrodes, mouseDown, setElectrodes]);

    useEffect(() => { // mouseover eventlistener over whole canvas
        // when dragging over a space that doesn't have an existing electrode, create new one
        // and stick in electrodes arr
        document.querySelector(".greenArea").addEventListener('mousemove', handleMouseMove)
        return () => {
            document.querySelector(".greenArea").removeEventListener('mousemove', handleMouseMove)
        }
    }, [handleMouseMove]);

    /* ########################### CONTEXT MENU START ########################### */
    const [clipboard, setClipboard] = useState([])
    function contextCopy(e) {
        const inits = electrodes.initPositions.filter((_, ind) => selected.includes(ind))
        const dels = electrodes.deltas.filter((_, ind) => selected.includes(ind))
        let abs = clipboard
        for (var i = 0; i < inits.length; i++) {
            let tmp = [inits[i][0] + dels[i][0], inits[i][1] + dels[i][1]]
            abs.push(tmp)
        }
        setClipboard(abs)
        setSelected([])
    }
    function contextPaste(e) {
        if (clipboard.length > 0) {
            let newInits = []
            let x = Math.floor(e.pageX / elecSize) * elecSize
            let y = Math.floor(e.pageY / elecSize) * elecSize
            for (var i = 0; i < clipboard.length; i++)
                newInits.push([x, y])

            let newDels = []
            for (var j = 0; j < clipboard.length; j++)
                newDels.push([clipboard[j][0] - clipboard[0][0], clipboard[j][1] - clipboard[0][1]])

            setElectrodes({
                initPositions: electrodes.initPositions.concat(newInits),
                deltas: electrodes.deltas.concat(newDels)
            })
            setSelected([])
            setClipboard([])
        }
    }
    function contextCut(e) {
        contextCopy()
        contextDelete()
    }
    function contextDelete(e) {
        let newPos = electrodes.initPositions.filter(function (val, ind) {
            return !selected.includes(ind)
        })
        let newDel = electrodes.deltas.filter(function (val, ind) {
            return !selected.includes(ind)
        })
        setSelected([])
        setElectrodes({ initPositions: newPos, deltas: newDel })
    }
    /* ########################### CONTEXT MENU END ########################### */

    /* ########################### COMBINE STUFF START ########################### */

    {/*
    function handleCombine(e) {
        // using selected and deltas, want to replace selected electrodes with one big one
        // want to enable even weirdly shaped ones -- only requirement is continguity

        // FOR NOW, JUST TRYNNA GET TWO (ASSUMED) CONTIGUOUS SQUARES TOGETHER
        e.preventDefault()
        if (selected.length < 2)
            return

        // we'll base the deltas off of position (0, 0)
        let oldDeltas = [...deltas] // going to be newDelta
        let oldHist = [...boxSelectHist]
        var furthestLeft = 4000;
        var furthestUp = 4000;
        var furthestRight = 0;
        var furthestDown = 0

        // hardcoded -- only for rectangles 
        for (var i = 0; i < selected.length; i++) {
            let newBoi = [oldDeltas[selected[i]][0] + delta.x + selected[i] % 5 * 120, oldDeltas[selected[i]][1] + delta.y + Math.floor(selected[i] / 5) * 120]
            if (newBoi[0] < furthestLeft) furthestLeft = newBoi[0]
            if (newBoi[0] + 110 > furthestRight) furthestRight = newBoi[0] + 110
            if (newBoi[1] < furthestUp) furthestUp = newBoi[1]
            if (newBoi[1] + 110 > furthestDown) furthestDown = newBoi[1] + 110

            oldDeltas[selected[i]] = [0, 0]
            // console.log(oldDeltas)
            oldHist[selected[i]] = 0
        }

        let pts = furthestLeft.toString() + "," + furthestUp.toString()
        pts += " " + furthestLeft.toString() + "," + furthestDown.toString()
        pts += " " + furthestRight.toString() + "," + furthestDown.toString()
        pts += " " + furthestRight.toString() + "," + furthestUp.toString()

        let newDeltas = oldDeltas.concat([[0, 0]])
        combiUnselect(oldHist)
        setDeltas(newDeltas)
        setSelected([])
        setCombined(combined.concat(pts))
        // any elems >= index numButtons is a combined elem w/ initial pos (0, 0)
    }
    */}

    /* ########################### COMBINE STUFF END ########################### */

    return (
        <div>
            {/* <button onClick={handleCombine}>Combine</button> */}
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
                        <DraggableItem key={ind} id={ind}>
                            <rect x={startPos[0]} y={startPos[1]} width="35" height="35" fill="black" key={ind} className="electrode" />
                        </DraggableItem>
                    )
                })
                }
            </svg>
            <ContextMenu names={["Cut", "Copy", "Paste", "Delete"]} funcs={[contextCut, contextCopy, contextPaste, contextDelete]} />
        </div>
    );
}