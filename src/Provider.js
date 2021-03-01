import React, { useState, useEffect } from "react";
import Context from "./context"
import Dexie from "dexie"
import useInterval from "./useInterval"
import { handleSave } from "./ControlPanel/SaveButton"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants"

const Provider = props => {
    const [state, setState] = useState({
        electrodes: {
            initPositions: [],
            deltas: []
        },
        selected: [],
        delta: null,
        mouseDown: false,
        drawing: false,
        db: new Dexie('ElecDB'),
    })

    // const [layout, setLayout] = useState(new Array(CANVAS_HEIGHT).fill(-1).map(() => new Array(CANVAS_WIDTH).fill(-1)))
    // const [layout, setLayout] = useState(
    //     [[-1, -1, -1, -1, -1],
    //     [-1, 2, 2, -1, -1],
    //     [-1, -1, -1, -1, 3],
    //     [-1, -1, -1, 3, 3],
    //     [-1, -1, -1, -1, -1],
    //     [-1, -1, -1, -1, -1]])

    const [combined, setCombined] = useState([])

    useEffect( // idb stuff
        () => {
            // create the store
            state.db.version(1).stores({ formData: 'id,value' })

            // perform a read/write transatiction on the new store
            state.db.transaction('rw', state.db.formData, async () => {
                // get elec layout from the data
                const dbLayout = await state.db.formData.get('layout')

                // if there's no layout in local storage, add an empty one
                if (!dbLayout) await state.db.formData.add({ id: 'layout', value: [] })
                else {
                    let initPos = [], dels = []
                    dbLayout.value.forEach((e) => {
                        if (e.charAt(0) === 's' && e.charAt(1) === 'q') {
                            let mapping = e.split(' ')
                            initPos.push([parseInt(mapping[1]), parseInt(mapping[2])])
                            dels.push([0, 0])
                        }
                    })
                    setState((stateBoi) => ({ ...stateBoi, electrodes: { initPositions: initPos, deltas: dels } }))
                }
            }).catch(e => console.log(e.stack || e))

            // close the database connection if form is unmounted or the
            // database connection changes
            return () => state.db.close()
        },
        // run effect whenever the database connection changes
        [state.db]
    )

    useInterval(() => {
        handleSave(state.electrodes, state.db)
    }, 10000);

    // console.log(layout)
    return (
        <Context.Provider
            value={{
                state,
                combined,
                setComboLayout: (newCombs) => { setCombined(newCombs) },
                setSelected: (newSelected) => { setState((stateBoi) => ({ ...stateBoi, selected: newSelected })) },
                setElectrodes: (elecs) => { setState((stateBoi) => ({ ...stateBoi, electrodes: elecs })) },
                setDelta: (del) => { setState((stateBoi) => ({ ...stateBoi, delta: del })) },
                setMouseDown: (md) => { setState((stateBoi) => ({ ...stateBoi, mouseDown: md })) },
                setDrawing: (draw) => { setState((stateBoi) => ({ ...stateBoi, drawing: draw })) }
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default Provider;