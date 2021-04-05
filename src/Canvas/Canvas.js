import React, { useEffect, useState, useCallback, useContext } from "react"
import DraggableItem from "./DraggableItem"
import DraggableComb from "./DraggableComb"

import { CanvasContext } from "../Contexts/CanvasProvider"
import { ActuationContext } from "../Contexts/ActuationProvider"
import { ContextMenu } from "../ContextMenu"
import { ELEC_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH, MAX_NUM_COMBINES } from "../constants"

export default function Canvas({ mode }) {
    const canvasContext = useContext(CanvasContext);
    const { electrodes, selected } = canvasContext.squares
    const { drawing, mouseDown } = canvasContext.state
    const { allCombined } = canvasContext.combined
    const combSelected = canvasContext.combined.selected
    const { setMouseDown, setDrawing, setElectrodes, setSelected, setComboLayout, setCombSelected } = canvasContext

    const actuationContext = useContext(ActuationContext);
    const { currentStep, pinActuate } = actuationContext.actuation
    const { actuatePin, pushHistory } = actuationContext

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

    /* ########################### ACTUATION START ########################### */
    function handleClick(ind) {
        if (mode === "SEQ") {
            if (pinActuate.get(currentStep).content.has(ind)) {
                pushHistory({ type: "actuate", pin: ind, id: currentStep, act: false });
            } else {
                pushHistory({ type: "actuate", pin: ind, id: currentStep, act: true });
            }
            actuatePin(ind);
            console.log(`Actuate ${ind} electrode`)
        }
    }
    /* ########################### ACTUATION END ########################### */
    /* ########################### CONTEXT MENU START ########################### */
    const [clipboard, setClipboard] = useState([])
    function contextCopy() {
        let squares = [], combined = []

        if (selected.length > 0) {
            const inits = electrodes.initPositions.filter((_, ind) => selected.includes(ind))
            const dels = electrodes.deltas.filter((_, ind) => selected.includes(ind))
            for (var i = 0; i < inits.length; i++) {
                let tmp = [inits[i][0] + dels[i][0], inits[i][1] + dels[i][1]]
                squares.push(tmp)
            }
            setSelected([])
        }
        if (combSelected.length > 0) {
            let minLayval = Infinity, maxLayval = -1
            for (var comb of allCombined) {
                if (combSelected.includes(comb[2]) && comb[2] < minLayval)
                    minLayval = comb[2]
                if (comb[2] > maxLayval) maxLayval = comb[2]
            }
            let gap = maxLayval + 1 - minLayval
            for (comb of allCombined) {
                if (combSelected.includes(comb[2]))
                    combined.push([comb[0], comb[1], comb[2] + gap])
            }
            setCombSelected([])
        }
        setClipboard({ squares: squares, combined: combined })
    }

    function contextPaste(e, xPos, yPos) {
        if (selected.length > 0)
            setSelected([])
        if (combSelected.length > 0)
            setCombSelected([])
        const numSquaresCopied = clipboard.squares.length
        const numCombinedCopied = clipboard.combined.length
        if (numSquaresCopied > 0 || numCombinedCopied > 0) {
            let x = Math.floor(parseFloat(xPos.slice(0, xPos.length - 2)) / ELEC_SIZE) * ELEC_SIZE
            let y = Math.floor(parseFloat(yPos.slice(0, xPos.length - 2)) / ELEC_SIZE) * ELEC_SIZE
            if (numSquaresCopied > 0) {
                let newInits = []
                for (var i = 0; i < numSquaresCopied; i++)
                    newInits.push([x, y])

                let newDels = []
                const squares = clipboard.squares
                for (var j = 0; j < numSquaresCopied; j++)
                    newDels.push([squares[j][0] - squares[0][0], squares[j][1] - squares[0][1]])

                setElectrodes({
                    initPositions: electrodes.initPositions.concat(newInits),
                    deltas: electrodes.deltas.concat(newDels)
                })
            }
            if (numCombinedCopied > 0) {
                const combined = clipboard.combined
                const first = clipboard.squares.length > 0 ? clipboard.squares[0] : combined[0]
                let newCombs = []
                for (var k = 0; k < numCombinedCopied; k++)
                    newCombs.push([x + combined[k][0] - first[0], y + combined[k][1] - first[1], combined[k][2]])
                setComboLayout(allCombined.concat(newCombs))
            }
            setClipboard([])
        }
    }

    function contextCut() {
        contextCopy()
        contextDelete()
    }

    function squaresDelete() {
        let newPos = electrodes.initPositions.filter(function (val, ind) {
            return !selected.includes(ind)
        })
        let newDel = electrodes.deltas.filter(function (val, ind) {
            return !selected.includes(ind)
        })
        setSelected([])
        setElectrodes({ initPositions: newPos, deltas: newDel })
    }

    function combinedDelete() {
        setComboLayout(allCombined.filter(combi => !combSelected.includes(combi[2])))
        setCombSelected([])
    }
    function contextDelete() {
        combinedDelete()
        squaresDelete()
    }
    /* ########################### CONTEXT MENU END ########################### */

    /* ########################### COMBINE STUFF START ########################### */

    function handleCombine(e) {
        e.preventDefault()
        if (selected.length < 2) {
            window.alert("You need to combine at least 2 square electrodes.")
            return
        }
        if (combSelected.length > 0) {
            window.alert("You can't combine already combined electrodes.")
            return
        }

        let positions = []
        // see if selected electrodes are adjacent to each other
        let layVals = new Set([])
        for (var i = 0; i < allCombined.length; i++)
            layVals.add(allCombined[i][2])

        const newLastFreeInd = getCombinedLastFreeInd()

        let xMin = Infinity, xMax = -1, yMin = Infinity, yMax = -1
        for (var j = 0; j < selected.length; j++) {
            let init = electrodes.initPositions[selected[j]], del = electrodes.deltas[selected[j]]
            let x = init[0] + del[0], y = init[1] + del[1]
            if (x < xMin) xMin = x
            if (x > xMax) xMax = x

            if (y < yMin) yMin = y
            if (y > yMax) yMax = y

            positions.push([x, y, newLastFreeInd])
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

        for (var row of adj) { // if selected electrodes aren't adj, alert then return
            if (row.includes(1)) {
                window.alert("Selected electrodes to combine aren't adjacent")
                return
            }
        }

        setComboLayout(allCombined.concat(positions))
        squaresDelete()
    }

    const [finalCombines, setFinalCombines] = useState([]) // strings representing allCombined electrodes

    // render combines
    useEffect(() => {
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
        let combines = new Array(Math.floor(MAX_NUM_COMBINES)).fill(null) // just strs representing points

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
        let paths = []
        for (var k = 0; k < MAX_NUM_COMBINES; k++) {
            const path = combines[k]
            if (path !== null) {
                paths.push([path, k])
            }
        }
        setFinalCombines(paths)
    }, [allCombined, setComboLayout])

    /* ########################### COMBINE STUFF END ########################### */
    /* ########################### HELPERS START ########################### */
    function isArrayInArray(arr, item) {
        var item_as_string = JSON.stringify(item);

        var contains = arr.some(function (ele) {
            return JSON.stringify(ele) === item_as_string;
        });
        return contains;
    }

    function getCombinedLastFreeInd() {
        // can sort selected then go through and return immediately when 
        // hit selected+1 not in allCombined[i][2]
        combSelected.sort(function (a, b) { return a - b })
        let layVals = new Set()
        for (var comb of allCombined)
            layVals.add(comb[2])

        // probably don't actually need lowest last free index 
        // but would be unfortunate if they keep combining and deleting 
        // on the same design and if it kept picking the latest free index (allCombined.length)
        let newLastFreeInd = 0
        for (var layoutVal of layVals) {
            if (!layVals.has(layoutVal + 1)) {
                newLastFreeInd = layoutVal + 1
                break
            }
        }
        return newLastFreeInd
    }
    /* ########################### HELPERS END ########################### */
    return (
        <div style={{ postion: 'absolute', left: 0, top: 0, width: CANVAS_WIDTH * ELEC_SIZE, height: CANVAS_HEIGHT * ELEC_SIZE }} >
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
                        <DraggableItem key={ind} id={ind} mode={mode} >
                            <rect x={startPos[0]} y={startPos[1]} width={ELEC_SIZE - 5} height={ELEC_SIZE - 5} key={ind}
                                className={`electrode ${mode === "SEQ" && pinActuate.has(currentStep) && pinActuate.get(currentStep).content.has(ind) ? "toSeq" : ""}`}
                                onClick={() => handleClick(ind)}
                            />
                        </DraggableItem>
                    )
                })
                }
                {finalCombines.map((comb, ind) => {
                    return (
                        <DraggableComb key={ind} id={comb[1]}>
                            <path d={comb[0]} className="electrode" />
                        </DraggableComb>
                    )
                })
                }
            </svg>
            <ContextMenu names={["Cut", "Copy", "Paste", "Delete", "Combine"]} funcs={[contextCut, contextCopy, contextPaste, contextDelete, handleCombine]} />
        </div>
    );
}