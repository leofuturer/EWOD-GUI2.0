import React, { useRef, useEffect, useCallback, useContext, useState } from "react"
import ReactDraggable from 'react-draggable';
import useSelected from "./useSelected"
import "./Canvas.css"
import Context from "../context"

function DraggableItem({ id, children }) {
    const context = useContext(Context)
    const { setSelected, setDelta } = context
    const { delta, mouseDown, drawing } = context.state
    const { electrodes } = context.squares
    const elecSelected = context.squares.selected

    let deltas = electrodes.deltas

    const isSelected = elecSelected && elecSelected.indexOf(id) >= 0;

    let transform = {}
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
            setSelected([...new Set([...elecSelected, id])])
    }, [delta, drawing, id, isSelected, mouseDown, elecSelected, setSelected])

    useEffect(() => {
        if (dragItem && dragItem.current) {
            let item = dragItem.current
            item.addEventListener('mouseover', handleMouseOver)
            return () => {
                item.removeEventListener('mouseover', handleMouseOver)
            }
        }
    }, [handleMouseOver]);

    const [savingChanges, setSaveChanges] = useState(false)

    useSelected(() => {
        setSaveChanges(false)
    }, savingChanges)

    return (
        <ReactDraggable
            axis='none'
            onStart={() => {
                setDelta({ x: 0, y: 0 })
            }}
            onDrag={(e, data) => { setDelta({ x: data.x, y: data.y }, id) }}
            onStop={() => {
                setSaveChanges(true)
            }}
            position={{ x: 0, y: 0 }}
            disabled={!isSelected}
            grid={[40, 40]}
            nodeRef={dragItem}
        >
            <g ref={dragItem}>
                <g style={transform}>
                    <g className={`${isSelected ? "selected" : ""}`}>
                        {children}
                    </g>
                </g>
            </g>
        </ReactDraggable >
    )
}

export default DraggableItem