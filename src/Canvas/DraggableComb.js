import React, { useRef, useEffect, useCallback, useContext, useState } from "react"
import ReactDraggable from 'react-draggable';
import useSelected from "./useSelected"
import "./Canvas.css"
import Context from "../context"

function DraggableComb({ id, children }) {
    const context = useContext(Context)
    const { setDelta, setCombSelected, setDragging } = context
    const { delta, mouseDown, drawing, isDragging } = context.state
    const { selected } = context.combined

    const isSelected = selected && selected.indexOf(id) >= 0;

    let transform = {}
    let boop;
    if (delta === null) boop = { x: 0, y: 0 }
    else boop = delta

    if (isSelected) transform = { transform: `translate(${boop.x}px, ${boop.y}px)` }

    const dragItem = useRef(null)

    const handleMouseDown = useCallback((e) => {
        if (e.which === 1) {
            if (!isSelected && !drawing && !isDragging)
                setCombSelected([...new Set([...selected, id])])
            else if (isSelected)
                setDragging(true)
        }
    }, [isDragging, setDragging, setCombSelected, selected, id, drawing, isSelected]);

    const handleMouseOver = useCallback(() => {
        if (mouseDown === true && !isSelected && !drawing && !isDragging)
            setCombSelected([...new Set([...selected, id])])
    }, [isDragging, drawing, id, isSelected, mouseDown, selected, setCombSelected])

    useEffect(() => {
        if (dragItem && dragItem.current) {
            let item = dragItem.current
            item.addEventListener('mousedown', handleMouseDown);
            item.addEventListener('mouseover', handleMouseOver)
            return () => {
                item.removeEventListener('mousedown', handleMouseDown);
                item.removeEventListener('mouseover', handleMouseOver)
            }
        }
    }, [handleMouseDown, handleMouseOver]);

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
            onDrag={(e, data) => { setDelta({ x: data.x, y: data.y }) }}
            onStop={() => {
                if (isDragging) {
                    if (delta.x !== 0 || delta.y !== 0)
                        setSaveChanges(true)
                    else setCombSelected([])
                    setDragging(false)
                }
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