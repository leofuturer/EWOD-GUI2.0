import React, { useContext } from "react"
import Context from "../context"

export function SaveButton() {
    const context = useContext(Context);
    const { electrodes, db } = context.state

    function handleSave(e) {
        let newContents = []
        // for (var i = 0; i < combined.length; i++) {
        //     var pos = combined[i].split(/,\s/)
        //     let boop = "combine" + i + " " + pos[0] + " " + pos[1]
        //     newContents.push(boop)
        //     console.log(boop)
        // }

        for (var j = 0; j < electrodes.initPositions.length; j++) {
            const x = electrodes.initPositions[j][0] + electrodes.deltas[j][0]
            const y = electrodes.initPositions[j][1] + electrodes.deltas[j][1]
            let boop = "square " + x + " " + y
            newContents.push(boop)
        }

        db.formData.put({ id: "layout", value: newContents })
    }

    return (
        <button onClick={handleSave}>Save</button>
    )
}