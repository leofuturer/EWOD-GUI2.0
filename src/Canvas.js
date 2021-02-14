import React, { useEffect, useState, useCallback, useContext } from "react"
import DraggableItem from "./DraggableItem"

import Context from "./context"
import { ContextMenu } from "./ContextMenu"

const elecSize = 40

export function Canvas(props) {
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
        document.addEventListener('mousemove', handleMouseMove)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [handleMouseMove]);

    function turnOnDraw(e) {
        setSelected([])
        setDrawing(!drawing)
    }

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
    let { combiUnselect, db } = props

    const [combined, setCombined] = useState([])

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

    /* ########################### IDB STUFF START ########################### */
    const [ewdContents, setEwdContents] = useState({ layout: [] })

    {/*
    function handleSave(e) {
        let newContents = []
        for (var i = 0; i < combined.length; i++) {
            var pos = combined[i].split(/,\s/)
            let boop = "combine" + i + " " + pos[0] + " " + pos[1]
            newContents.push(boop)
            console.log(boop)
        }

        for (var j = 0; j < boxSelectHist.length; j++) {
            if (boxSelectHist[j]) {
                var x = j % 5 * 120
                var y = Math.floor(j / 5) * 120
                let boop = "square " + x + " " + y
                newContents.push(boop)
                console.log(boop)
            }
        }

        console.log("#ENDOFLAYOUT#")
        console.log("0,0,0,0,0,0,0,0;100")
        console.log("#ENDOFSEQUENCE#")
        console.log("#ENDOFREPEAT#")
        setEwdContents({ layout: newContents })
        db.formput({ id: "layout", value: newContents })
    }
    */}

    useEffect(
        () => {
            // create the store
            db.version(1).stores({ formData: 'id,value' })
        },
        // run effect whenever the database connection changes
        [db]
    )

    useEffect(
        () => {
            // create the store
            db.version(1).stores({ formData: 'id,value' })

            // perform a read/write transatiction on the new store
            db.transaction('rw', db.formData, async () => {
                // get elec layout from the data
                const dbLayout = await db.formData.get('layout')

                // if the first or last name fields have not be added, add them
                if (!dbLayout) await db.formData.add({ id: 'layout', value: [] })

                // set the initial values
                setEwdContents({ layout: dbLayout ? dbLayout.value : [] })
            }).catch(e => {
                // log any errors
                console.log(e.stack || e)
            })

            // close the database connection if form is unmounted or the
            // database connection changes
            return () => db.close()
        },
        // run effect whenever the database connection changes
        [db]
    )
    /* ########################### IDB STUFF END ########################### */

    /* ########################### IDB STUFF END ########################### */
    return (
        <div>
            <button onClick={turnOnDraw}>Draw</button>
            {/* <button onClick={handleCombine}>Combine</button> */}
            {/* <button onClick={handleSave}>Save</button> */}
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
<<<<<<< HEAD
                        <DraggableItem key={ind} id={ind}
                            deltas={electrodes.deltas}
                            setDeltas={setElectrodes}
                            setSelected={setSelected}
                            selected={selected}
                            delta={delta}
                            onDrag={handleDrag}
                            combined={combined}
                            mouseDown={mouseDown}
                            drawing={drawing}
                        >
                            <rect x={startPos[0]} y={startPos[1]} width="35" height="35" fill="black" key={ind} className="electrode" 
                            onClick={()=>{alert("hello")}}/>
                        </DraggableItem>
                        )
=======
                        <DraggableItem key={ind} id={ind}>
                            <rect x={startPos[0]} y={startPos[1]} width="35" height="35" fill="black" key={ind} className="electrode" />
                        </DraggableItem>
                    )
>>>>>>> 58b5172fedb826bad2b5d3105129e1d5cab981ca
                })
                }
            </svg>
            <ContextMenu names={["Cut", "Copy", "Paste", "Delete"]} funcs={[contextCut, contextCopy, contextPaste, contextDelete]} />
        </div>
    );
}