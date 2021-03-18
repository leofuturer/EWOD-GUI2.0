import React, { useEffect, useState, useCallback, useContext } from "react"
import DraggableItem from "./DraggableItem"

import Context from "../context"
import { ContextMenu } from "../ContextMenu"
import { ELEC_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants"

export function Canvas() {
    const context = useContext(Context);
    const { electrodes, drawing, mouseDown, selected } = context.state
    // const { setMouseDown, setDrawing, setElectrodes, setSelected, setLayout } = context
    const { setMouseDown, setDrawing, setElectrodes, setSelected, combined, setComboLayout } = context

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
            const x = Math.floor(e.pageX / ELEC_SIZE) * ELEC_SIZE
            const y = Math.floor(e.pageY / ELEC_SIZE) * ELEC_SIZE
            for (var idx = 0; idx < deltas.length; idx++)
                // if an electrode already exists at this position
                if (x === initPositions[idx][0] + deltas[idx][0] && y === initPositions[idx][1] + deltas[idx][1]) {
                    elecAtXY = true
                    break
                }
            if (!elecAtXY)
                for (var ind = 0; ind < combined.length; ind++)
                    if (combined[ind][0] === x && combined[ind][1] === y) {
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
            let x = Math.floor(e.pageX / ELEC_SIZE) * ELEC_SIZE
            let y = Math.floor(e.pageY / ELEC_SIZE) * ELEC_SIZE
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
    function contextDelete() {
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

    function handleCombine(e) {
        e.preventDefault()
        if (selected.length < 2)
            return

        let positions = []
        // see if selected electrodes are adjacent to each other
        for (var j = 0; j < selected.length; j++) {
            let init = electrodes.initPositions[selected[j]], del = electrodes.deltas[selected[j]]
            positions.push([init[0] + del[0], init[1] + del[1], combined.length + 2])
        }
        positions.sort(function (a, b) {
            if (a[1] === b[1])
                return a[0] - b[0]
            return a[1] - b[1]
        })

        /* TODO: check that they're adjacent */

        setComboLayout(combined.concat(positions))
        contextDelete()
    }

    function isArrayInArray(arr, item) {
        var item_as_string = JSON.stringify(item);

        var contains = arr.some(function (ele) {
            return JSON.stringify(ele) === item_as_string;
        });
        return contains;
    }

    const [finalCombines, setFinalCombines] = useState([]) // strings representing combined electrodes
    useEffect(() => {
        if (combined.length === 0)
            return
        combined.sort(function (a, b) { // by row then column
            if (a[1] === b[1]) return a[0] - b[0]
            return a[1] - b[1]
        })

        let byX = {}
        for (var j = 0; j < combined.length; j++) {
            let x = combined[j][0], yAndLayVal = [combined[j][1], combined[j][2]]
            if (byX.hasOwnProperty(x)) byX[x].push(yAndLayVal)
            else byX[x] = [yAndLayVal]
        }
        let combines = new Array(Math.floor(CANVAS_WIDTH * CANVAS_HEIGHT / 2)).fill(null) // just strs representing points

        // inspiration from old EWOD-GUI
        for (var i = 0; i < combined.length; i++) {
            var x = combined[i][0], x2 = x + ELEC_SIZE
            var y = combined[i][1], y2 = y + ELEC_SIZE
            let pathstring = '', layVal = combined[i][2]

            // has electrode on right side
            if (i + 1 < combined.length && combined[i + 1][0] === x2 && combined[i + 1][2] === layVal) {
                if (isArrayInArray(byX[x], [y2, layVal])) {
                    if (isArrayInArray(byX[x2], [y2, layVal]))   //has electrode on three sides
                        pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 + 2) + ' L' + (x2 + 2) + ' ' + (y2 + 2) + ' L' + (x2 + 2) + ' ' + y + ' Z ';
                    else {  //has electrode on right and bottom side only
                        pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 - 5) + ' L' + (x2 + 2) + ' ' + (y2 - 5) + ' L' + (x2 + 2) + ' ' + y + ' Z ';
                        pathstring += 'M' + x + ' ' + (y2 - 5) + ' L' + x + ' ' + (y2 + 2) + ' L' + (x2 - 5) + ' ' + (y2 + 2) + ' L' + (x2 - 5) + ' ' + (y2 - 5) + ' Z ';
                    }
                }
                else    //has electrode on right only
                    pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 - 5) + ' L' + (x2 + 2) + ' ' + (y2 - 5) + ' L' + (x2 + 2) + ' ' + y + ' Z ';
            }
            else if (isArrayInArray(byX[x], [y2, layVal])) //has electrode on down only
                pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 + 2) + ' L' + (x2 - 5) + ' ' + (y2 + 2) + ' L' + (x2 - 5) + ' ' + y + ' Z ';
            else                                //has no electrode on either down or right
                pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 - 5) + ' L' + (x2 - 5) + ' ' + (y2 - 5) + ' L' + (x2 - 5) + ' ' + y + ' Z ';

            if (combines[layVal - 1] === null) combines[layVal - 1] = pathstring
            else combines[layVal - 1] += pathstring
        }
        setFinalCombines(combines.filter(x => x !== null))
    }, [combined, setComboLayout])

    /* ########################### COMBINE STUFF END ########################### */

    return (
        <div style={{ postion: 'absolute', left: 0, top: 0, width: CANVAS_WIDTH * ELEC_SIZE, height: CANVAS_HEIGHT * ELEC_SIZE }} >
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
                        <DraggableItem key={ind} id={ind}>
                            <rect x={startPos[0]} y={startPos[1]} width="35" height="35" fill="black" key={ind} className="electrode" />
                        </DraggableItem>
                    )
                })
                }
                {finalCombines.map((comb, ind) => {
                    return (
                        <DraggableItem key={ind + electrodes.deltas.length} id={ind + 2 + electrodes.deltas.length}>
                            <path key={ind} d={comb} fill="black" />
                        </DraggableItem>
                    )
                })
                }
            </svg>
            <ContextMenu names={["Cut", "Copy", "Paste", "Delete", "Combine"]} funcs={[contextCut, contextCopy, contextPaste, contextDelete, handleCombine]} />
        </div>
    );
}