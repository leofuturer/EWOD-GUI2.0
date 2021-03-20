import React from "react"
import Context from "../context"
export default function useSelected(callback, savingChanges) {
    const savedCallback = React.useRef();

    // Remember the latest callback.
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const context = React.useContext(Context)
    const { setSelected, setElectrodes, setDelta, setComboLayout, setCombSelected } = context
    const { delta } = context.state
    const { electrodes } = context.squares
    const elecSelected = context.squares.selected
    const { allCombined } = context.combined
    const combSelected = context.combined.selected
    let deltas = electrodes.deltas

    React.useEffect(() => {
        if (savingChanges) {
            // handle dragged singles
            let copy = [...deltas]

            for (var j = 0; j < elecSelected.length; j++)
                copy[elecSelected[j]] = [delta.x + deltas[elecSelected[j]][0], delta.y + deltas[elecSelected[j]][1]]

            setElectrodes({ initPositions: electrodes.initPositions, deltas: copy })
            setSelected([])

            // handle dragged combined
            combSelected.sort(function (a, b) { return a - b })

            let combines = allCombined
            for (var i = 0; i < combSelected.length; i++) {
                const layVal = combSelected[i]
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
            setComboLayout(combines)
            setDelta(null)

            savedCallback.current()
        }
    }, [savingChanges, allCombined, combSelected, delta, deltas, elecSelected, electrodes.initPositions, setCombSelected, setComboLayout, setDelta, setElectrodes, setSelected])
}
