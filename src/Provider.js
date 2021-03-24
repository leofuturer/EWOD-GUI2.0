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
                deleteCurrentStep: (step) => {
                    if(state.pinActuate.has(step)){
                        let newList = state.pinActuate;
                        if(newList.get(step).parent !== null){
                            let parent = newList.get(step).parent;
                            let ind = newList.get(parent).content.indexOf(step);
                            newList.get(parent).content.splice(ind,1);
                        }
                        newList.delete(step);
                        let n = 0;
                        newList.forEach((value, key)=>{
                            if(value.type === 'simple'){
                                value.order = n;
                                n++;
                            }
                        })
                        setState((stateBoi) => ({...stateBoi, pinActuate: newList, currentStep: step-1, simpleNum: state.simpleNum-1}));
                    }
                },
                insertStep: (obj) =>{
                    let newList = state.pinActuate;
                    if(newList.get(state.currentStep).parent!== null){
                        let parent = newList.get(state.currentStep).parent;
                        newList.get(parent).content.push(obj.id);
                        obj.parent = parent;
                    }
                    let arr = Array.from(newList);
                    let index = 0;
                    for(let e of arr){
                        if(e[1].id === state.currentStep){
                            break;
                        }
                        index++;
                    }
                    arr.splice(index+1, 0, [obj.id, obj]);
                    newList = new Map(arr);
                    let n = 0;
                    newList.forEach((value, key)=>{
                        if(value.type === 'simple'){
                            value.order = n;
                            n++;
                        }
                    })
                    if(obj.parent!==null){
                        newList.get(obj.parent).content.sort(function(a,b){
                            let ord1 = newList.get(a).order;
                            let ord2 = newList.get(b).order;
                            return ord1-ord2;
                        })
                    }
                    setState((stateBoi) => ({...stateBoi, pinActuate: newList, simpleNum: state.simpleNum+1}));
                },
                // duplicateCurrentStep: (step) => {
                //     if(state.pinActuate.has(step)){
                //         let newList = state.pinActuate;
                //         let next = Math.max(...[ ...newList.keys() ])+1;
                //         let newSeq = new ActuationSequence(next, "simple", state.simpleNum);
                //         newList.get(step).content.forEach(e => {
                //             newSeq.content.add(e);
                //         })
                //         newSeq.parent = null;
                //         newList.set(next, newSeq);
                //         setState((stateBoi) => ({...stateBoi, pinActuate: newList, simpleNum: state.simpleNum+1}));
                //     }
                // },
                addLoop: (from, to, repTime) =>{
                    let newList = state.pinActuate;
                    let l = newList.size;
                    let newSeq = new ActuationSequence(newList.size, "loop");
                    newList.forEach((value, key)=>{
                        if(value.type==='simple' && value.order>=from && value.order <= to){
                            newSeq.pushOneStep(value);
                        }
                    })
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
                        state.pinActuate.get(seq.content[i]).parent = null;
                    }
                    seq.content = [];
                    newList.forEach((value, key)=>{
                        if(value.type==='simple' && value.order>=from && value.order <= to){
                            seq.pushOneStep(value);
                        }
                    })
                    console.log(newList);
                    setState((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                },
                deleteLoop: (id) => {
                    let newList = state.pinActuate;
                    newList.get(id).content.forEach(e =>{
                        newList.get(e).parent = null;
                    });
                    newList.delete(id);
                    setState((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                pushHistory: (obj) => {
                    let newHist = state.history;
                    newHist.length = state.historyIndex+1;
                    newHist.push(obj);
                    let newIndex = state.historyIndex+1;
                    if(newHist.length > 10) {
                        newHist.shift();
                        newIndex--;
                    }
                    setState((stateBoi)=> ({...stateBoi, history: newHist, historyIndex: newIndex}));

                },
                clearAll: () => {
                    setState((stateBoi)=>({
                        ...stateBoi,
                        pinActuate: new Map([[0, new ActuationSequence(0, "simple", 0)]]),
                        currentStep: 0,
                        simpleNum: 1,
                    }))
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