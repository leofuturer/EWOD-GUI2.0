import React, { useState } from "react";
import Context from "./context";
import ActuationSequence from "./Actuation";

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
        pinActuate: [new ActuationSequence(0, "simple")],
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
                    newList[state.currentStep].actuatePin(pinNum);
                    setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                setCurrentStep: (step) => {
                    setState((stateBoi) => ({...stateBoi, currentStep: step}));
                    if(step >= state.pinActuate.length){
                        let newList = state.pinActuate;
                        newList.push(new ActuationSequence(step, "simple"));
                        setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                    }
                },
                addLoop: (from, to) =>{
                    let newList = state.pinActuate;
                    let newSeq = new ActuationSequence(newList.length, "loop");
                    for(let i = from; i <= to; i++){
                        newSeq.pushOneStep(newList[i]);
                    }
                    newList.push(newSeq);
                    setState((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                }
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default Provider;