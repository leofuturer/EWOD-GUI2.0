import React, { useRef, useEffect, useCallback, useContext, useState } from "react"
import ReactDraggable from 'react-draggable';
import useSelected from "./useSelected"
import "./Canvas.css"
import Context from "../context"

function DraggableComb({ id, children }) {
    const context = useContext(Context)
    const { setDelta, setCombSelected } = context
    const { delta, mouseDown, drawing } = context.state
    const { selected } = context.combined

    const isSelected = selected && selected.indexOf(id) >= 0;

    let transform = {}
    let boop;
    if (delta === null) boop = { x: 0, y: 0 }
    else boop = delta

    if (isSelected) transform = { transform: `translate(${boop.x}px, ${boop.y}px)` }

    const dragItem = useRef(null);

    const handleMouseOver = useCallback(() => {
        if (mouseDown === true && !isSelected && !drawing && delta === null)
            setCombSelected([...new Set([...selected, id])])
    }, [delta, drawing, id, isSelected, mouseDown, selected, setCombSelected])

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

export default DraggableComb