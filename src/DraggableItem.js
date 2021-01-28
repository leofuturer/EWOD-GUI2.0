import React, { useRef, useEffect, useCallback } from "react"
import ReactDraggable from 'react-draggable';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import "./App.css"

function DraggableItem({ deltas, setSelected, setDeltas, selected, id, delta, onDrag, children, mouseDown, created, create, drawing }) {
    const [isDragging, setIsDragging] = React.useState(false);
    const isSelected = selected && selected.indexOf(id) >= 0;
    const isCreated = created && created.includes(id)

    let transform = null
    if (isSelected)
        transform = { transform: `translate(${delta.x + deltas[id][0]}px, ${delta.y + deltas[id][1]}px)` }

    if (!isSelected)
        transform = { transform: `translate(${deltas[id][0]}px, ${deltas[id][1]}px)` }

    const dragItem = useRef(null);

    const handleMouseOver = useCallback(() => {
        // console.log("hewwo")
        if (mouseDown === true && !isSelected) {
            console.log("whoosh")
            if (isCreated) {
                // if (isSelected) setSelected(selected.filter(item => item !== id))
                setSelected([...new Set([...selected, id])])
            } else if (drawing) {
                console.log("hello")
                create([...new Set([...created, id])])
            }
        }
    }, [mouseDown, created, selected])

    function handleClick() {

    }

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
                {/* <ContextMenuTrigger id="some_unique_identifier" renderTag='g' holdToDisplay={0}> */}
                <g style={transform}>
                    <g className={`${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""} ${isCreated ? "exist" : "noExist"}`}>
                        {children}
                    </g>
                </g>
                {/* </ContextMenuTrigger> */}
                {/* <ContextMenu id="some_unique_identifier">
                    <MenuItem data={{ foo: 'bar' }} onClick={handleClick}>
                        ContextMenu Item 1
                    </MenuItem>
                    <MenuItem data={{ foo: 'bar' }} onClick={handleClick}>
                        ContextMenu Item 2
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem data={{ foo: 'bar' }} onClick={handleClick}>
                        ContextMenu Item 3
                    </MenuItem>
                </ContextMenu> */}
            </g>
        </ReactDraggable >

    )
}

export default DraggableItem