import React, { useRef, useEffect, useCallback, useContext, useState } from "react"
import ReactDraggable from 'react-draggable';
import useSelected from "./useSelected"
import "./Canvas.css"
import { CanvasContext } from "../Contexts/CanvasProvider"
import { ELEC_SIZE } from "../constants"

function DraggableItem({ id, children, mode }) {
    const context = useContext(CanvasContext)
    const { setSelected, setDelta, setDragging } = context
    const { delta, mouseDown, drawing, isDragging } = context.state
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
    else
        transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` }

    const dragItem = useRef(null)

    const handleMouseDown = useCallback((e) => {
        if (e.which === 1) {
            if (!isSelected && !drawing && !isDragging)
                setSelected([...new Set([...elecSelected, id])])
            else if (isSelected)
                setDragging(true)
        }
    }, [isDragging, setDragging, setSelected, elecSelected, id, drawing, isSelected]);

    useEffect(() => {
        if (dragItem && dragItem.current) {
            let item = dragItem.current
            item.addEventListener('mousedown', handleMouseDown);
            return () => {
                item.removeEventListener('mousedown', handleMouseDown);
            }
        }
    }, [handleMouseDown]);

    // handles selection of existing electrodes
    const handleMouseOver = useCallback(() => {
        if (mouseDown === true && !isSelected && !drawing && !isDragging)
            setSelected([...new Set([...elecSelected, id])])
    }, [isDragging, drawing, id, isSelected, mouseDown, elecSelected, setSelected])

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
            onDrag={(e, data) => { setDelta({ x: data.x, y: data.y }) }}
            onStop={() => {
                if (isDragging) {
                    if (delta.x !== 0 || delta.y !== 0)
                        setSaveChanges(true)
                    else setSelected([])
                    setDragging(false)
                }
            }}
            position={{ x: 0, y: 0 }}
            disabled={!isSelected}
            grid={[ELEC_SIZE, ELEC_SIZE]}
            nodeRef={dragItem}
        >
            <g ref={dragItem}>
                <g style={transform}>
                    <g className={`${isSelected && mode === "CAN" ? "selected" : ""}`}>
                        {children}
                    </g>
                </g>
            </g>
        </ReactDraggable >
    )
}

export default DraggableItem