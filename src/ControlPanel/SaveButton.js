import React, { useContext } from "react"
import Context from "../context"
import { genFileContents } from "./genFileContents"

export function handleSave(electrodes, db) {


    const newContents = genFileContents(electrodes)
    db.formData.put({ id: "layout", value: newContents })
}

export default function SaveButton() {
    const { electrodes, db } = useContext(Context).state
    return (
        <button onClick={() => handleSave(electrodes, db)}>Save</button>
    )
}