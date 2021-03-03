import React, { useEffect, useState, useCallback, useContext } from "react"
import DraggableItem from "./DraggableItem"

import Context from "./context"
import { ContextMenu } from "./ContextMenu"

const elecSize = 40


export function Canvas() {
    const context = useContext(Context);
    const { electrodes, drawing, mouseDown, selected, startActuate, currentStep, pinActuate } = context.state
    const { setMouseDown, setDrawing, setElectrodes, setSelected, actuatePin, pushHistory } = context

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
            const x = Math.floor(e.pageX / elecSize - 4) * elecSize
            const y = Math.floor(e.pageY / elecSize - 3) * elecSize
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
        document.addEventListener('mousemove', handleMouseMove)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
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

    function handleClick(ind) {
        if (startActuate) {
            if(pinActuate.get(currentStep).content.has(ind)){
                pushHistory({type: "actuate", pin: ind, id: currentStep, act: false});
            }else{
                pushHistory({type: "actuate", pin: ind, id: currentStep, act: true});
            }
            actuatePin(ind);
            console.log(`Actuate ${ind} electrode`)
        }
    }

    return (
        <div style={{postion: 'absolute', left: 0, top: 0, width: '120vw', height: '120vh'}}>
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
                        <DraggableItem key={ind} id={ind}>
                            <rect x={startPos[0]} y={startPos[1]} width="35" height="35" fill="black" key={ind} className="electrode"
                                style={{
                                    fill: (pinActuate.has(currentStep) && pinActuate.get(currentStep).content.has(ind)) ? 'red' : 'black'
                                }}
                                onClick={() => handleClick(ind)} />
                        </DraggableItem>
                    )
                })
                }
            </svg>
            <ContextMenu names={["Cut", "Copy", "Paste", "Delete"]} funcs={[contextCut, contextCopy, contextPaste, contextDelete]} />
        </div>
    );
}