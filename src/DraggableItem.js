import React, { useRef, useEffect, useCallback } from "react"
import ReactDraggable from 'react-draggable';
import "./App.css"

function DraggableItem({ deltas, setSelected, setDeltas, selected, id, delta, onDrag, children, mouseDown, created, create }) {
    const [isDragging, setIsDragging] = React.useState(false);
    const isSelected = selected && selected.indexOf(id) >= 0;
    const isCreated = created && created.includes(id)

    let transform = null
    if (isSelected)
        transform = { transform: `translate(${delta.x + deltas[id][0]}px, ${delta.y + deltas[id][1]}px)` }

    if (!isSelected)
        transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` }

    // function handleClick(e, idx) {
    //     if (e.shiftKey) {
    //         onSelect(idx);
    //     }
    // }

    const dragItem = useRef(null);

    const handleMouseOver = useCallback(() => {
        if (mouseDown) {
            if (isCreated) {
                if (isSelected) setSelected(selected.filter(item => item !== id))
                else setSelected([...new Set([...selected, id])])
            } else {
                let after = [...new Set([...created, id])]
                // console.log(id + ": before: " + created + "; after: " + after)
                create(after)
            }
        }
    }, [mouseDown, created, selected])

    useEffect(() => {
        if (dragItem && dragItem.current) {
            dragItem.current.addEventListener('mouseover', handleMouseOver)
            return () => {
                dragItem.current.removeEventListener('mouseover', handleMouseOver)
            }
        }
    }, [handleMouseOver]);

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
                    <g className={`
                                    ${isSelected ? "selected" : ""} 
                                    ${isDragging ? "dragging" : ""} 
                                    ${isCreated ? "exist" : "noExist"}
                                `}
                    // onClick={e => handleClick(e, id)}
                    >
                        {children}
                    </g>
                </g>
            </g>

        </ReactDraggable >
    )
}

export default DraggableItem