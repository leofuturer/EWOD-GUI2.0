import React, { useEffect, useState, useCallback } from "react"
import DraggableItem from "./DraggableItem"
import { Motion, spring } from "react-motion"
import MenuItem from '@material-ui/core/MenuItem';

// import DragSelect from "dragselect"

const numCols = 5
const numRows = 5
const numButtons = numCols * numRows

export function Canvas(props) {
    const [selected, setSelected] = useState([]);
    // to hold existing electrodes' initial positions + deltas
    const [electrodes, setElectrodes] = useState({
        initPositions: [],
        deltas: []
    })

    const [delta, setDelta] = useState(null);
    function handleDrag(delta) { setDelta(delta); }

    const [mouseDown, setMouseDown] = useState(false)

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
    }, []);

    const [drawing, setDrawing] = useState(false)

    const handleMouseUp = useCallback(() => {
        setDrawing(false);
        setMouseDown(false)
    }, [])

    useEffect(() => {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp)
        };
    }, [handleMouseDown, handleMouseUp]);

    // electrode curr pos = init + deltas[idx]
    // wanna see if curr XY = electrodes[idx] + deltas[idx]
    // creating new electrode
    const handleMouseMove = useCallback((e) => {
        if (drawing && mouseDown) {
            let elecAtXY = false

            // const initPositions = electrodes
            const initPositions = electrodes.initPositions
            const deltas = electrodes.deltas
            const x = Math.floor(e.pageX / 40) * 40
            const y = Math.floor(e.pageY / 40) * 40
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
    }, [drawing, mouseDown, electrodes]);

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
    const [xPos, setXPos] = useState("0px");
    const [yPos, setYPos] = useState("0px");
    const [showMenu, setShowMenu] = useState(false);

    const handleContextMenu = useCallback(
        (e) => {
            e.preventDefault();
            setXPos(`${e.pageX}px`);
            setYPos(`${e.pageY}px`);
            setShowMenu(true);
        },
        [setXPos, setYPos]
    );

    const handleClick = useCallback(() => {
        showMenu && setShowMenu(false);
    }, [showMenu]);

    useEffect(() => {
        document.addEventListener("click", handleClick);
        document.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [handleClick, handleContextMenu]);

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
        db.formData.put({ id: "layout", value: newContents })
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

    return (
        <div>
            <button onClick={turnOnDraw}>Draw</button>
            {/* <button onClick={handleCombine}>Combine</button> */}
            {/* <button onClick={handleSave}>Save</button> */}
            <svg className="greenArea" xmlns="http://www.w3.org/2000/svg"  >
                {electrodes.initPositions.map((startPos, ind) => {
                    return (
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
                            <rect x={startPos[0]} y={startPos[1]} width="35" height="35" fill="black" key={ind} className="electrode" />
                        </DraggableItem>)
                })
                }
            </svg>
            {/* CONTEXT MENU BELOW */}
            <Motion
                defaultStyle={{ opacity: 0 }}
                style={{ opacity: !showMenu ? spring(0) : spring(1) }}
            >
                {(interpolatedStyle) => (
                    <>
                        {showMenu ? (
                            <div
                                className="menu-container"
                                style={{
                                    top: yPos,
                                    left: xPos,
                                    opacity: interpolatedStyle.opacity,
                                }}
                            >
                                <ul
                                    className="menu"
                                    style={{
                                        position: "absolute",
                                        top: yPos,
                                        left: xPos,

                                        backgroundColor: "white",
                                        padding: "10px 0px",
                                        borderRadius: "5px",
                                        boxShadow: "2px 2px 30px lightgrey"
                                    }}
                                >
                                    <MenuItem>Cut</MenuItem>
                                    <MenuItem>Copy</MenuItem>
                                    <MenuItem>Paste</MenuItem>
                                    <MenuItem>Delete</MenuItem>
                                    <MenuItem>Add</MenuItem>
                                </ul>
                            </div>
                        ) : (
                                <></>
                            )}
                    </>
                )}
            </Motion>
        </div>
    );
}