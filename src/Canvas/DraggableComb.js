import React, { useRef, useEffect, useCallback, useContext } from "react"
import ReactDraggable from 'react-draggable';
import "./Canvas.css"
import Context from "../context"

function DraggableComb({ id, children }) {
    const context = useContext(Context)
    const { setDelta, setComboLayout, setCombSelected, setDragging } = context
    const { delta, mouseDown, drawing, isDragging } = context.state
    const { allCombined, selected } = context.combined

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

    return (
        <ReactDraggable
            axis='none'
            onStart={() => {
                setDragging(true);
                setDelta({ x: 0, y: 0 })
            }}
            onDrag={(e, data) => { setDelta({ x: data.x, y: data.y }, id) }}
            onStop={() => {
                selected.sort(function (a, b) { return a - b })

                let combines = []
                for (var i = 0; i < selected.length; i++) {
                    let layVal = selected[i]
                    let selectedCombs = []
                    for (var k = 0; k < allCombined.length; k++)
                        if (allCombined[k][2] === layVal) {
                            allCombined[k][0] = parseInt(allCombined[k][0]) + delta.x
                            allCombined[k][1] = parseInt(allCombined[k][1]) + delta.y
                            selectedCombs.push(allCombined[k])
                        }
                    combines = allCombined.filter(x => x[2] !== layVal).concat(selectedCombs)
                }

                setCombSelected([])
                setDragging(false)
                setDelta(null)
                setComboLayout(combines)
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

export default DraggableComb