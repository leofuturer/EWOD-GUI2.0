import React, { useEffect, useState, useCallback, useContext } from "react"
import DraggableItem from "./DraggableItem"
import DraggableComb from "./DraggableComb"

import Context from "../context"
import { ContextMenu } from "../ContextMenu"
import { ELEC_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants"

export function Canvas() {
    const context = useContext(Context);
    const { electrodes, selected } = context.squares
    const { drawing, mouseDown } = context.state
    const { allCombined, lastFreeInd } = context.combined
    const combSelected = context.combined.selected
    const { setMouseDown, setDrawing, setElectrodes, setSelected, setComboLayout, setCombSelected, setLastFreeInd } = context

    // sets mousedown status for selecting existing electrodes
    const handleMouseDown = useCallback((event) => {
        switch (event.which) {
            case 1: // left mouse button pressed
                setMouseDown(true)
                break;
            default: // you're weird
                break;
        }
    }, [setMouseDown]);

    const handleMouseUp = useCallback(() => {
        setDrawing(false)
        setMouseDown(false)
    }, [setDrawing, setMouseDown])

    useEffect(() => {
        document.querySelector(".greenArea").addEventListener('mousedown', handleMouseDown);
        document.querySelector(".greenArea").addEventListener('mouseup', handleMouseUp)
        return () => {
            document.querySelector(".greenArea").removeEventListener('mousedown', handleMouseDown);
            document.querySelector(".greenArea").removeEventListener('mouseup', handleMouseUp)
        };
    }, [handleMouseDown, handleMouseUp]);

    const handleMouseMove = useCallback((e) => {    // creating new electrode
        if (drawing && mouseDown) {
            let elecAtXY = false

            // electrode curr pos = init + deltas[idx]
            // wanna see if curr XY = electrodes[idx] + deltas[idx]
            const initPositions = electrodes.initPositions
            const deltas = electrodes.deltas
            const x = Math.floor(e.offsetX / ELEC_SIZE) * ELEC_SIZE
            const y = Math.floor(e.offsetY / ELEC_SIZE) * ELEC_SIZE

            for (var idx = 0; idx < deltas.length; idx++)
                // if an electrode already exists at this position
                if (x === initPositions[idx][0] + deltas[idx][0] && y === initPositions[idx][1] + deltas[idx][1]) {
                    elecAtXY = true
                    break
                }
            if (!elecAtXY)
                for (var ind = 0; ind < allCombined.length; ind++)
                    if (allCombined[ind][0] === x && allCombined[ind][1] === y) {
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
    }, [drawing, electrodes, mouseDown, setElectrodes, allCombined]);

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
    function contextCopy() {
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
    function contextPaste(e, xPos, yPos) {
        if (clipboard.length > 0) {
            let newInits = []
            let x = Math.floor(parseFloat(xPos.slice(0, xPos.length - 2)) / ELEC_SIZE) * ELEC_SIZE
            let y = Math.floor(parseFloat(yPos.slice(0, xPos.length - 2)) / ELEC_SIZE) * ELEC_SIZE
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
    function contextCut() {
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
        let layVals = new Set([])
        for (var i = 0; i < allCombined.length; i++)
            layVals.add(allCombined[i][2])

        let xMin = Infinity, xMax = -1, yMin = Infinity, yMax = -1
        for (var j = 0; j < selected.length; j++) {
            let init = electrodes.initPositions[selected[j]], del = electrodes.deltas[selected[j]]
            let x = init[0] + del[0], y = init[1] + del[1]
            if (x < xMin) xMin = x
            if (x > xMax) xMax = x

            if (y < yMin) yMin = y
            if (y > yMax) yMax = y

            positions.push([x, y, lastFreeInd])
        }
        /* CHECK NODES ARE ADJACENT BEFORE COMBINING */
        const numRows = (yMax - yMin) / ELEC_SIZE + 1, numCols = (xMax - xMin) / ELEC_SIZE + 1
        let adj = new Array(numRows).fill(0).map(() => new Array(numCols).fill(0))
        // want 2D grid from xMin to xMax, yMin to yMax
        // indexed 0 on both axes

        /*
            ex: y: 40-120, x: 80-160, startY = 1, startX = 2
            (y , x)
            (40, 80) ->  (1 - 1, 2 - 2) want (0, 0)
            (120, 160) -> (3 - 1, 4 - 2)
        */

        const startY = yMin / ELEC_SIZE, startX = xMin / ELEC_SIZE

        for (var pos of positions)
            adj[(pos[1] / ELEC_SIZE) - startY][(pos[0] / ELEC_SIZE) - startX] = 1

        function connect(y, x) {
            if (y < 0 || y >= numRows || x < 0 || x >= numCols)
                return
            if (adj[y][x] === 1) {
                adj[y][x] = 0
                connect(y - 1, x)
                connect(y + 1, x)
                connect(y, x - 1)
                connect(y, x + 1)
            }
        }
        connect((positions[0][1] / ELEC_SIZE) - startY, (positions[0][0] / ELEC_SIZE) - startX)

        for (var row of adj) {
            if (row.includes(1)) {
                window.alert("Selected electrodes to combine aren't adjacent")
                return
            }
        }
        setComboLayout(allCombined.concat(positions))
        contextDelete()
        setLastFreeInd(lastFreeInd + 1)
    }

    function isArrayInArray(arr, item) {
        var item_as_string = JSON.stringify(item);

        var contains = arr.some(function (ele) {
            return JSON.stringify(ele) === item_as_string;
        });
        return contains;
    }

    const [finalCombines, setFinalCombines] = useState([]) // strings representing allCombined electrodes

    // render combines
    useEffect(() => {
        if (allCombined.length === 0)
            return
        allCombined.sort(function (a, b) { // by row then column
            if (a[1] === b[1]) return a[0] - b[0]
            return a[1] - b[1]
        })
        let byX = {}
        for (var j = 0; j < allCombined.length; j++) {
            let x = allCombined[j][0], yAndLayVal = [allCombined[j][1], allCombined[j][2]]
            if (byX.hasOwnProperty(x)) byX[x].push(yAndLayVal)
            else byX[x] = [yAndLayVal]
        }
        let combines = new Array(Math.floor(CANVAS_WIDTH * CANVAS_HEIGHT / 2)).fill(null) // just strs representing points

        // inspiration from old EWOD-GUI
        for (var i = 0; i < allCombined.length; i++) {
            var x = allCombined[i][0], x2 = x + ELEC_SIZE
            var y = allCombined[i][1], y2 = y + ELEC_SIZE
            let pathstring = '', layVal = allCombined[i][2]

            // has electrode on right side
            if (i + 1 < allCombined.length && allCombined[i + 1][0] === x2 && allCombined[i + 1][2] === layVal) {
                if (isArrayInArray(byX[x], [y2, layVal])) {
                    if (isArrayInArray(byX[x2], [y2, layVal]))   //has electrode on three sides
                        pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + y2 + ' L' + x2 + ' ' + y2 + ' L' + x2 + ' ' + y + ' Z ';
                    else {  //has electrode on right and bottom side only
                        pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 - 5) + ' L' + x2 + ' ' + (y2 - 5) + ' L' + x2 + ' ' + y + ' Z ';
                        pathstring += 'M' + x + ' ' + (y2 - 5) + ' L' + x + ' ' + y2 + ' L' + (x2 - 5) + ' ' + y2 + ' L' + (x2 - 5) + ' ' + (y2 - 5) + ' Z ';
                    }
                }
                else    //has electrode on right only
                    pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 - 5) + ' L' + x2 + ' ' + (y2 - 5) + ' L' + x2 + ' ' + y + ' Z ';
            }
            else if (isArrayInArray(byX[x], [y2, layVal])) //has electrode on down only
                pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + y2 + ' L' + (x2 - 5) + ' ' + y2 + ' L' + (x2 - 5) + ' ' + y + ' Z ';
            else                                //has no electrode on either down or right
                pathstring = 'M' + x + ' ' + y + ' L' + x + ' ' + (y2 - 5) + ' L' + (x2 - 5) + ' ' + (y2 - 5) + ' L' + (x2 - 5) + ' ' + y + ' Z ';

            if (combines[layVal] === null) combines[layVal] = pathstring
            else combines[layVal] += pathstring
        }
        setFinalCombines(combines.filter(x => x !== null))
    }, [allCombined, setComboLayout])

    /* ########################### COMBINE STUFF END ########################### */

    return (
        <div style={{ postion: 'absolute', left: 0, top: 0, width: CANVAS_WIDTH * ELEC_SIZE, height: CANVAS_HEIGHT * ELEC_SIZE }} >
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
                        <DraggableItem key={ind} id={ind}>
                            <rect x={startPos[0]} y={startPos[1]} width={ELEC_SIZE - 5} height={ELEC_SIZE - 5} key={ind} className="electrode" />
                        </DraggableItem>
                    )
                })
                }
                {finalCombines.map((comb, ind) => {
                    return (
                        <DraggableComb key={ind} id={ind}>
                            <path key={ind} d={comb} />
                        </DraggableComb>
                    )
                })
                }
            </svg>
            <ContextMenu names={["Cut", "Copy", "Paste", "Delete", "Combine"]} funcs={[contextCut, contextCopy, contextPaste, contextDelete, handleCombine]} />
        </div>
    );
}