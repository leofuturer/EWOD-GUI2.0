import React, { useRef, useEffect, useCallback, useState, useContext } from "react"
import ReactDraggable from 'react-draggable';
import "./App.css"
import Context from "./context"

function DraggableItem({ id, children }) {
    const context = useContext(Context)
    const { setSelected, setElectrodes, setDelta } = context
    const { selected, delta, electrodes, mouseDown, drawing } = context.state
    let deltas = electrodes.deltas

    const [isDragging, setIsDragging] = useState(false);
    const isSelected = selected && selected.indexOf(id) >= 0;

    let transform = null
    let boop;
    if (delta === null) boop = { x: 0, y: 0 }
    else boop = delta
    if (isSelected)
        transform = { transform: `translate(${boop.x + deltas[id][0]}px, ${boop.y + deltas[id][1]}px)` }

    if (!isSelected)
        transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` }

    const dragItem = useRef(null);

    // handles selection of existing electrodes
    const handleMouseOver = useCallback(() => {
        if (mouseDown === true && !isSelected && !drawing && delta === null)
            setSelected([...new Set([...selected, id])])
    }, [delta, drawing, id, isSelected, mouseDown, selected, setSelected])

    useEffect(() => {
        if (dragItem && dragItem.current) {
            let item = dragItem.current
            item.addEventListener('mouseover', handleMouseOver)
            return () => {
                item.removeEventListener('mouseover', handleMouseOver)
            }
        }
    }, [handleMouseOver]);

    return (
        <ReactDraggable
            axis='none'
            onStart={() => {
                setIsDragging(true);
                setDelta({ x: 0, y: 0 })
            }}
            onDrag={(e, data) => { setDelta({ x: data.x, y: data.y }, id) }}
            onStop={(e, data) => {
                let copy = [...deltas]

                for (var i = 0; i < selected.length; i++)
                    copy[selected[i]] = [delta.x + deltas[selected[i]][0], delta.y + deltas[selected[i]][1]]

                setElectrodes({ initPositions: electrodes.initPositions, deltas: copy })
                setSelected([])
                setIsDragging(false)
                setDelta(null)
            }}
            position={{ x: 0, y: 0 }}
            disabled={!isSelected}
            grid={[40, 40]}
            nodeRef={dragItem}
        >
            <g ref={dragItem}>
                <g style={transform}>
                    <g className={`${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}>
                        {children}
                    </g>
                </g>
            </g>
        </ReactDraggable >
    )
}

export default DraggableItem