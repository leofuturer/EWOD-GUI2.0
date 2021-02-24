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
        pinActuate: new Map([[0, new ActuationSequence(0, "simple")]]),
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
                    newList.get(state.currentStep).actuatePin(pinNum);
                    setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                setCurrentStep: (step) => {
                    if(state.pinActuate.has(step)&&state.pinActuate.get(step).type ==='loop'){
                        step++;
                    }
                    if(!state.pinActuate.has(step)){
                        let newList = state.pinActuate;
                        let newSeq = new ActuationSequence(step, "simple");
                        if(state.pinActuate.has(step-1)&& state.pinActuate.get(step-1).type==='simple'){
                            state.pinActuate.get(step-1).content.forEach(e=>{
                                newSeq.content.add(e);
                            })
                        }
                        newList.set(step, newSeq);
                        setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                    }
                    setState((stateBoi) => ({...stateBoi, currentStep: step}));
                },
                addLoop: (from, to) =>{
                    let newList = state.pinActuate;
                    let l = newList.length;
                    let newSeq = new ActuationSequence(newList.length, "loop");
                    for(let i = from; i <= to; i++){
                        newSeq.pushOneStep(newList[i]);
                    }
                    newList.set(l, newSeq);
                    setState((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                }
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default Provider;