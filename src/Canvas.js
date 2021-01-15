import React, { useRef, useEffect, useState } from "react"
import ReactDraggable from 'react-draggable';

const numButtons = 25

const canvasSize = { width: "100vw", height: "50vh" }

function DraggableItem({ deltas, setSelected, setDeltas, selected, id, delta, onSelect, onDrag, children }) {
    const [isDragging, setIsDragging] = React.useState(false);
    const isSelected = selected && selected.indexOf(id) >= 0;

    let transform = null
    if (isSelected)
        transform = { transform: `translate(${delta.x + deltas[id][0]}px, ${delta.y + deltas[id][1]}px)` }

    if (!isSelected)
        transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` }

    function handleClick(e, idx) {
        if (e.shiftKey) {
            onSelect(idx);
        }
    }

    const dragItem = useRef(null);

    return (
        <ReactDraggable
            axis='none'
            onStart={() => { setIsDragging(true) }}
            onDrag={(e, data) => { onDrag({ x: data.x, y: data.y }, id) }}
            onStop={(e, data) => {
                let copy = [...deltas]

                for (var i = 0; i < selected.length; i++)
                    copy[selected[i]] = [delta.x + deltas[selected[i]][0], delta.y + deltas[selected[i]][1]]

                setDeltas(copy)
                setSelected([])
                setIsDragging(false)
                onDrag({ x: 0, y: 0 })
            }}
            position={{ x: 0, y: 0 }}
            disabled={!isSelected}
            grid={[40, 40]}
            nodeRef={dragItem}
        >
            <g ref={dragItem}>
                <g style={transform}>
                    <g className={`${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`} onClick={e => handleClick(e, id)}>
                        {children}
                    </g>
                </g>
            </g>

        </ReactDraggable >

    )
}

function DraggableElements(props) {
    let { boxSelectHist, combined, ...restProps } = props

    let draggable = boxSelectHist.map((boxSelected, idx) => {
        if (boxSelected) {
            let xBoi = idx % 5 * 120, yBoi = Math.floor(idx / 5) * 120
            return (
                <DraggableItem key={idx} id={idx} {...restProps}>
                    <rect x={xBoi} y={yBoi} width="110" height="110" fill="black" key={idx} />
                </DraggableItem>
            )
        }
    })

    let filtered = draggable.filter(function (el) {
        return el != null;
    });

    if (combined.length > 0) {
        for (var i = 0; i < combined.length; i++)
            filtered.push(
                <DraggableItem key={numButtons} id={numButtons} {...restProps}>
                    <polygon fill="black" points={combined[i]} />
                </DraggableItem>
            )
    }
    return (
        <>{filtered}</>
    )
}

export function Canvas(props) {
    const [selected, setSelected] = React.useState([]);

    const [delta, setDelta] = React.useState({ x: 0, y: 0 });
    function handleDrag(delta) { setDelta(delta); }

    const [deltas, setDeltas] = React.useState(new Array(numButtons).fill([0, 0]));

    function select(idx) {
        const newSelection = selected.indexOf(idx) >= 0 ? selected.filter(item => item !== idx) : [...selected, idx];
        setSelected(newSelection);
    }
    let { boxSelectHist, combiUnselect, db } = props

    const [combined, setCombined] = React.useState([])

    const [ewdContents, setewdContents] = useState({ layout: [] })

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
                let boop = "square" + x + " " + y
                newContents.push(boop)
                console.log(boop)
            }
        }

        console.log("#ENDOFLAYOUT#")
        console.log("0,0,0,0,0,0,0,0;100")
        console.log("#ENDOFSEQUENCE#")
        console.log("#ENDOFREPEAT#")
        setewdContents({ layout: newContents })
        db.formData.put({ id: "layout", value: newContents })
    }

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
                setewdContents({ layout: dbLayout ? dbLayout.value : [] })
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

    return (
        <div>
            <button onClick={handleCombine}>Combine</button>
            <button onClick={handleSave}>Save</button>
            <svg className="canvas blueArea" {...canvasSize} xmlns="http://www.w3.org/2000/svg"  >
                <DraggableElements
                    deltas={deltas}
                    setSelected={setSelected}
                    setDeltas={setDeltas}
                    selected={selected}
                    onSelect={select}
                    delta={delta}
                    onDrag={handleDrag}
                    boxSelectHist={boxSelectHist}
                    combined={combined}
                >

                </DraggableElements>
            </svg>
        </div>
    );
}