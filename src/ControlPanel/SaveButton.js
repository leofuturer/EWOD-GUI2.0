import React, { useContext } from "react"
import Context from "../context"
import { genFileContents } from "./genFileContents"

export function SaveButton() {
    const { electrodes, db } = useContext(Context).state

    function handleSave() {
        const newContents = genFileContents(electrodes)
        db.formData.put({ id: "layout", value: newContents })
    }

    return (
        <button onClick={handleSave}>Save</button>
    )
}