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
        history: [],
        historyIndex: -1,
        delta: null,
        mouseDown: false,
        drawing: false,
        startActuate: false,
        pinActuate: new Map([[0, new ActuationSequence(0, "simple", 0)]]),
        currentStep: 0,
        simpleNum: 1,
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
                        let newSeq = new ActuationSequence(step, "simple", state.simpleNum);
                        if(state.pinActuate.has(step-1)&& state.pinActuate.get(step-1).type==='simple'){
                            state.pinActuate.get(step-1).content.forEach(e=>{
                                newSeq.content.add(e);
                            })
                        }
                        newList.set(step, newSeq);
                        setState((stateBoi) => ({...stateBoi, pinActuate: newList, simpleNum: state.simpleNum+1}));
                    }
                    setState((stateBoi) => ({...stateBoi, currentStep: step}));
                },
                addLoop: (from, to, repTime) =>{
                    let newList = state.pinActuate;
                    let l = newList.size;
                    let newSeq = new ActuationSequence(newList.size, "loop");
                    for(let i = from; i <= to; i++){
                        let step = newList.get(i);
                        if(step.type === "simple"){
                            newSeq.pushOneStep(newList.get(i));
                        }
                    }
                    newSeq.repTime = repTime;
                    newList.set(l, newSeq);
                    console.log(newList);
                    setState((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                },
                updateLoop: (from, to, repTime, key) => {
                    let newList = state.pinActuate;
                    let seq = newList.get(key);
                    seq.repTime = repTime;
                    for(let i = 0; i < seq.content.length; i++){
                        if(seq.content[i]<from || seq.content[i]>to){
                            newList.get(seq.content[i]).parent = null;
                            seq.content.splice(i, 1);
                        }
                    }
                    console.log(newList);
                    setState((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                },
                pushHistory: (obj) => {
                    let newHist = state.history;
                    newHist.push(obj);
                    setState((stateBoi)=> ({...stateBoi, history: newHist, historyIndex: state.historyIndex+1}));

                },
                undo: ()=>{
                    if(state.historyIndex>-1){
                        let obj = state.history[state.historyIndex];
                        let newList = state.pinActuate;
                        // {type: "actuate", pin: number, id: number, act: true}
                        if(obj.type === "actuate"){
                            let seq = newList.get(obj.id)
                            if(obj.act){
                                seq.content.delete(obj.pin);
                            }else{
                                seq.content.add(obj.pin);
                            }
                        }
                        //to be continue
                        setState((stateBoi)=> ({...stateBoi, pinActuate: newList, historyIndex: state.historyIndex-1}));
                    }
                },
                redo: ()=>{
                    if(state.historyIndex<state.history.length-1){
                        let obj = state.history[state.historyIndex+1];
                        let newList = state.pinActuate;
                        // {type: "actuate", pin: number, id: number, act: true}
                        if(obj.type === "actuate"){
                            let seq = newList.get(obj.id)
                            if(!obj.act){
                                seq.content.delete(obj.pin);
                            }else{
                                seq.content.add(obj.pin);
                            }
                        }
                        //to be continue
                        setState((stateBoi)=> ({...stateBoi, pinActuate: newList, historyIndex: state.historyIndex+1}));
                    }
                }
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default Provider;