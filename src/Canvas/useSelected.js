import React from "react"
import Context from "../context"
import { CANVAS_TRUE_HEIGHT, CANVAS_TRUE_WIDTH } from "../constants"
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
            let copy;
            if (elecSelected.length > 0) {
                copy = [...deltas]

                for (var j = 0; j < elecSelected.length; j++) {
                    let init = electrodes.initPositions[elecSelected[j]]
                    let newDelX = delta.x + deltas[elecSelected[j]][0], newDelY = delta.y + deltas[elecSelected[j]][1]
                    if (newDelX < 0 || newDelX + init[0] >= CANVAS_TRUE_WIDTH || newDelY < 0 || newDelY + init[1] >= CANVAS_TRUE_HEIGHT) {
                        setSelected([])
                        setCombSelected([])
                        return
                    }
                    copy[elecSelected[j]] = [newDelX, newDelY]
                }
                // don't want to setElectrodes here because 
                // might have combined being dragged out of bounds in next for loop
                // in which case we wouldn't want to change our electrodes' current positions
                setSelected([])
            }

            // handle dragged combined
            let combines;
            if (combSelected.length > 0) {
                combSelected.sort(function (a, b) { return a - b })

                for (var i = 0; i < combSelected.length; i++) {
                    const layVal = combSelected[i]
                    let selectedCombs = []
                    for (var k = 0; k < allCombined.length; k++) {
                        if (allCombined[k][2] === layVal) {
                            let newX = parseInt(allCombined[k][0]) + delta.x, newY = parseInt(allCombined[k][1]) + delta.y
                            // // TODO: disallow combined electrodes from being dragged over grid
                            // if (newX < 0 || newX >= CANVAS_TRUE_WIDTH || newY < 0 || newY >= CANVAS_TRUE_HEIGHT) {
                            //     setSelected([])
                            //     setCombSelected([])
                            //     return
                            // }
                            allCombined[k][0] = newX
                            allCombined[k][1] = newY
                            selectedCombs.push(allCombined[k])
                        }
                    }
                    combines = allCombined.filter(x => x[2] !== layVal).concat(selectedCombs)
                }
                setCombSelected([])
                setComboLayout(combines)
            }

            if (elecSelected.length > 0)
                setElectrodes({ initPositions: electrodes.initPositions, deltas: copy })

            setDelta(null)

            savedCallback.current()
        }
    }, [savingChanges, allCombined, combSelected, delta, deltas, elecSelected, electrodes.initPositions, setCombSelected, setComboLayout, setDelta, setElectrodes, setSelected])
}
