import React, { useEffect, useState, useCallback } from "react"
import DraggableItem from "./DraggableItem"

// import DragSelect from "dragselect"

const numCols = 5
const numRows = 5
const numButtons = numCols * numRows

function DraggableElements(props) {
    let { combined, ...restProps } = props

    /* with dragselect in the future hopefully */
    // useEffect(
    //     () => {
    //         let dragBoop = new DragSelect({
    //             selectables: document.querySelectorAll('rect.electrode'),
    //             area: document.querySelector("svg.greenArea"),
    //             // callback: e => console.log(e)
    //         });
    //         dragBoop.subscribe("elementselect", (elec) => { console.log("huzzah") })
    //         // console.log(dragBoop.getSelectables())
    //     }
    // )

    let draggable = []
    for (var r = 0; r < numRows; r++) {
        for (var c = 0; c < numCols; c++) {
            let ind = numCols * r + c
            draggable.push(
                <DraggableItem key={ind} id={ind} {...restProps}>
                    <rect x={c * 120} y={r * 120} width="110" height="110" fill="black" key={ind} className="electrode" />
                </DraggableItem>
            )
        }
    }

    // if (combined.length > 0) {
    //     for (var i = 0; i < combined.length; i++)
    //         draggable.push(
    //             <DraggableItem key={numButtons} id={numButtons} {...restProps}>
    //                 <polygon fill="black" points={combined[i]} />
    //             </DraggableItem>
    //         )
    // }
    return (
        <>{draggable}</>
    )
}

export function Canvas(props) {
    const [selected, setSelected] = useState([]);
    const [created, setCreated] = useState([])
    // console.log(created)

    const [delta, setDelta] = useState({ x: 0, y: 0 });
    function handleDrag(delta) { setDelta(delta); }

    const [deltas, setDeltas] = useState(new Array(numButtons).fill([0, 0]));

    const [mouseDown, setMouseDown] = useState(false)

    const handleMouseDown = useCallback((event) => {
        console.log(event)
        switch (event.which) {
            case 1:
                console.log('Left Mouse button pressed.');
                break;
            case 2:
                console.log('Middle Mouse button pressed.');
                break;
            case 3:
                console.log('Right Mouse button pressed.');
                break;
            default:
                console.log('You have a strange Mouse!');
        }
        console.log("set mouse down")
        setMouseDown(true)
    }, []);

    const [drawing, setDrawing] = useState(false)
    console.log(drawing)
    const handleMouseUp = useCallback(() => {
        console.log("mouse up");
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

    // function select(idx) {
    //     const newSelection = selected.indexOf(idx) >= 0 ? selected.filter(item => item !== idx) : [...selected, idx];
    //     setSelected(newSelection);
    // }

    // const select = useCallback((idx) => {
    //     if (mouseDown && created[idx]) {
    //         setSelected([...new Set([...selected, idx])]);
    //     }
    // }, [mouseDown, selected]);

    // const create = useCallback((idx) => {
    //     console.log("created in create| " + created)
    //     const newCreation = created.indexOf(idx) >= 0 ? created.filter(item => item !== idx) : [...created, idx]
    //     setCreated(newCreation)
    // }, [created, setCreated])

    function turnOnDraw(e) {
        setSelected([])
        setDrawing(!drawing)
    }

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
                <DraggableElements
                    deltas={deltas}
                    setSelected={setSelected}
                    setDeltas={setDeltas}
                    selected={selected}
                    drawing={drawing}
                    delta={delta}
                    onDrag={handleDrag}
                    created={created}
                    create={setCreated}
                    combined={combined}
                    mouseDown={mouseDown}
                >

                </DraggableElements>
            </svg>
        </div>
    );
}