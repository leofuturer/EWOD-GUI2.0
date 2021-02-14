import React, { useState } from "react";
import Context from "./context"

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
        startActuate: false,
        pinActuate: [new Set()],
        currentStep: 0,
    });

    return (
        <Context.Provider
            value={{
                state,
                setSelected: (newSelected) => { setState((stateBoi) => ({ ...stateBoi, selected: newSelected })) },
                setElectrodes: (elecs) => { setState((stateBoi) => ({ ...stateBoi, electrodes: elecs })) },
                setDelta: (del) => { setState((stateBoi) => ({ ...stateBoi, delta: del })) },
                setMouseDown: (md) => { setState((stateBoi) => ({ ...stateBoi, mouseDown: md })) },
                setDrawing: (draw) => { setState((stateBoi) => ({ ...stateBoi, drawing: draw })) },
                setStartActuate: () => { setState((stateBoi) => ({...stateBoi, startActuate: !state.startActuate}))},
                actuatePin: (pinNum) => {
                    let newList = state.pinActuate;
                    if(newList[state.currentStep].has(pinNum)) newList[state.currentStep].delete(pinNum);
                    else newList[state.currentStep].add(pinNum);
                    setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                setCurrentStep: (step) => {
                    setState((stateBoi) => ({...stateBoi, currentStep: step}));
                    if(step >= state.pinActuate.length ){
                        let newList = state.pinActuate;
                        newList.push(new Set());
                        setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                    }
                }
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default Provider;