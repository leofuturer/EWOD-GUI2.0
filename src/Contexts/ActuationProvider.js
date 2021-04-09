import React, { useState } from "react";
import ActuationSequence from "../Actuation";

const ActuationContext = React.createContext();

const ActuationProvider = props => {
    const [actuation, setActuation] = useState({
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
        <ActuationContext.Provider
            value={{
                actuation,
                setStartActuate: () => { setActuation((stateBoi) => ({...stateBoi, startActuate: !actuation.startActuate}))},
                actuatePin: (pinNum) => {
                    let newList = actuation.pinActuate;
                    newList.get(actuation.currentStep).actuatePin(pinNum);
                    setActuation((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                setCurrentStep: (step) => {
                    if(actuation.pinActuate.has(step)&&actuation.pinActuate.get(step).type ==='loop'){
                        step++;
                    }
                    if(!actuation.pinActuate.has(step)){
                        let newList = actuation.pinActuate;
                        let newSeq = new ActuationSequence(step, "simple", actuation.simpleNum);
                        if(actuation.pinActuate.has(step-1)&& actuation.pinActuate.get(step-1).type==='simple'){
                            actuation.pinActuate.get(step-1).content.forEach(e=>{
                                newSeq.content.add(e);
                            })
                        }
                        newList.set(step, newSeq);
                        setActuation((stateBoi) => ({...stateBoi, pinActuate: newList, simpleNum: actuation.simpleNum+1}));
                    }
                    setActuation((stateBoi) => ({...stateBoi, currentStep: step}));
                },
                deleteCurrentStep: (step) => {
                    if(actuation.pinActuate.size === 1) return;
                    if(actuation.pinActuate.has(step)){
                        let newList = actuation.pinActuate;
                        if(newList.get(step).parent !== null){
                            let parent = newList.get(step).parent;
                            if(newList.get(parent).content.length===1){
                                return;
                            }
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
                        let newStep = actuation.pinActuate.keys().next().value;
                        setActuation((stateBoi) => ({...stateBoi, pinActuate: newList, currentStep: newStep, simpleNum: actuation.simpleNum-1}));
                    }
                },
                insertStep: (obj) =>{
                    let newList = actuation.pinActuate;
                    if(newList.get(actuation.currentStep).parent!== null){
                        let parent = newList.get(actuation.currentStep).parent;
                        newList.get(parent).content.push(obj.id);
                        obj.parent = parent;
                    }
                    let arr = Array.from(newList);
                    let index = 0;
                    for(let e of arr){
                        if(e[1].id === actuation.currentStep){
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
                    setActuation((stateBoi) => ({...stateBoi, pinActuate: newList, simpleNum: actuation.simpleNum+1}));
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
                    let newList = actuation.pinActuate;
                    let l = newList.size;
                    let newSeq = new ActuationSequence(newList.size, "loop");
                    let content_list = [];
                    let error = 0;
                    newList.forEach((value, key)=>{
                        if(value.type==='simple' && value.order>=from && value.order <= to){
                            if(error===1) return;
                            if(value.parent!==null) {
                                error = 1;
                                return;
                            }
                            content_list.push(value);
                        }
                    })
                    if(error === 1) {
                        alert("Loop Overlap! Please change the range of frame.");
                        return;
                    }
                    if(content_list.length!== to-from+1){
                        alert("Invalid frame range.");
                        return;
                    }
                    newSeq.pushAllSteps(content_list);
                    newSeq.repTime = repTime;
                    newList.set(l, newSeq);
                    console.log(newList);
                    setActuation((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                },
                updateLoop: (from, to, repTime, key) => {
                    let newList = actuation.pinActuate;
                    let seq = newList.get(key);
                    let content_list = [];
                    let error = 0;
                    newList.forEach((value, key)=>{
                        if(value.type==='simple' && value.order>=from && value.order <= to){
                            if(error === 1) return;
                            if(value.parent !== null){
                                error = 1;
                                return;
                            }
                            content_list.push(value);
                        }
                    })
                    if(error === 1) {
                        alert("Loop Overlap! Please change the range of frame.");
                        return;
                    }
                    if(content_list.length!== to-from+1){
                        alert("Invalid frame range.");
                        return;
                    }
                    seq.repTime = repTime;
                    for(let i = 0; i < seq.content.length; i++){
                        actuation.pinActuate.get(seq.content[i]).parent = null;
                    }
                    seq.content = [];
                    seq.pushAllSteps(content_list);
                    console.log(newList);
                    setActuation((stateBoi)=> ({...stateBoi, pinActuate: newList}));
                },
                deleteLoop: (id) => {
                    let newList = actuation.pinActuate;
                    newList.get(id).content.forEach(e =>{
                        newList.get(e).parent = null;
                    });
                    newList.delete(id);
                    setActuation((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                pushHistory: (obj) => {
                    let newHist = actuation.history;
                    newHist.length = actuation.historyIndex+1;
                    newHist.push(obj);
                    let newIndex = actuation.historyIndex+1;
                    if(newHist.length > 10) {
                        newHist.shift();
                        newIndex--;
                    }
                    setActuation((stateBoi)=> ({...stateBoi, history: newHist, historyIndex: newIndex}));

                },
                clearAll: () => {
                    setActuation((stateBoi)=>({
                        ...stateBoi,
                        pinActuate: new Map([[0, new ActuationSequence(0, "simple", 0)]]),
                        currentStep: 0,
                        simpleNum: 1,
                    }))
                },
                updateDuration: (key, time) => {
                    let newList = actuation.pinActuate;
                    newList.get(key).duration = time;
                    setActuation((stateBoi) => ({...stateBoi, pinActuate: newList}));
                },
                undo: ()=>{
                    if(actuation.historyIndex>-1){
                        let obj = actuation.history[actuation.historyIndex];
                        let newList = actuation.pinActuate;
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
                        setActuation((stateBoi)=> ({...stateBoi, pinActuate: newList, historyIndex: actuation.historyIndex-1}));
                    }
                },
                redo: ()=>{
                    if(actuation.historyIndex<actuation.history.length-1){
                        let obj = actuation.history[actuation.historyIndex+1];
                        let newList = actuation.pinActuate;
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
                        setActuation((stateBoi)=> ({...stateBoi, pinActuate: newList, historyIndex: actuation.historyIndex+1}));
                    }
                }
            }}
        >
            {props.children}
        </ActuationContext.Provider>
    );
};

export { ActuationProvider, ActuationContext };