import React, { useState } from "react";
import ActuationSequence from "../Actuation";

const ActuationContext = React.createContext();
const ActuationProvider = props => {

    const [actuation, setActuation] = useState({
        history: [],
        historyIndex: -1,
        pinActuate: new Map([[0, new ActuationSequence(0, "simple", 0)]]),
        currentStep: 0,
        simpleNum: 1,
    });

    return (
        <ActuationContext.Provider
            value={{
                actuation,
                actuatePin: (pinNum) => {
                    let newList = actuation.pinActuate;
                    newList.get(actuation.currentStep).actuatePin(pinNum);
                    setActuation((prev) => ({ ...prev, pinActuate: newList }));
                },
                setCurrentStep: (step) => {
                    if (actuation.pinActuate.has(step) && actuation.pinActuate.get(step).type === 'loop') {
                        step++;
                    }
                    if (!actuation.pinActuate.has(step)) {
                        let newList = actuation.pinActuate;
                        let newSeq = new ActuationSequence(step, "simple", actuation.simpleNum);
                        if (actuation.pinActuate.has(step - 1) && actuation.pinActuate.get(step - 1).type === 'simple') {
                            actuation.pinActuate.get(step - 1).content.forEach(e => {
                                newSeq.content.add(e);
                            })
                        }
                        newList.set(step, newSeq);
                        setActuation((prev) => ({ ...prev, pinActuate: newList, simpleNum: actuation.simpleNum + 1 }));
                    }
                    setActuation((prev) => ({ ...prev, currentStep: step }));
                },
                addLoop: (from, to, repTime) => {
                    let newList = actuation.pinActuate;
                    let l = newList.size;
                    let newSeq = new ActuationSequence(newList.size, "loop");
                    for (let i = from; i <= to; i++) {
                        let step = newList.get(i);
                        if (step.type === "simple") {
                            newSeq.pushOneStep(newList.get(i));
                        }
                    }
                    newSeq.repTime = repTime;
                    newList.set(l, newSeq);
                    console.log(newList);
                    setActuation((prev) => ({ ...prev, pinActuate: newList }));
                },
                updateLoop: (from, to, repTime, key) => {
                    let newList = actuation.pinActuate;
                    let seq = newList.get(key);
                    seq.repTime = repTime;
                    for (let i = 0; i < seq.content.length; i++) {
                        if (seq.content[i] < from || seq.content[i] > to) {
                            newList.get(seq.content[i]).parent = null;
                            seq.content.splice(i, 1);
                        }
                    }
                    console.log(newList);
                    setActuation((prev) => ({ ...prev, pinActuate: newList }));
                },
                pushHistory: (obj) => {
                    let newHist = actuation.history;
                    newHist.length = actuation.historyIndex + 1;
                    newHist.push(obj);
                    setActuation((prev) => ({ ...prev, history: newHist, historyIndex: actuation.historyIndex + 1 }));

                },
                undo: () => {
                    if (actuation.historyIndex > -1) {
                        let obj = actuation.history[actuation.historyIndex];
                        let newList = actuation.pinActuate;
                        // {type: "actuate", pin: number, id: number, act: true}
                        if (obj.type === "actuate") {
                            let seq = newList.get(obj.id)
                            if (obj.act) {
                                seq.content.delete(obj.pin);
                            } else {
                                seq.content.add(obj.pin);
                            }
                        }
                        //to be continue
                        setActuation((prev) => ({ ...prev, pinActuate: newList, historyIndex: actuation.historyIndex - 1 }));
                    }
                },
                redo: () => {
                    if (actuation.historyIndex < actuation.history.length - 1) {
                        let obj = actuation.history[actuation.historyIndex + 1];
                        let newList = actuation.pinActuate;
                        // {type: "actuate", pin: number, id: number, act: true}
                        if (obj.type === "actuate") {
                            let seq = newList.get(obj.id)
                            if (!obj.act) {
                                seq.content.delete(obj.pin);
                            } else {
                                seq.content.add(obj.pin);
                            }
                        }
                        //to be continue
                        setActuation((prev) => ({ ...prev, pinActuate: newList, historyIndex: actuation.historyIndex + 1 }));
                    }
                }
            }}>
            {props.children}
        </ActuationContext.Provider>
    )
}

export { ActuationContext, ActuationProvider }