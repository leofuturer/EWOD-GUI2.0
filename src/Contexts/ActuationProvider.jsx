import React, { useState } from 'react';
import ActuationSequence from '../Actuation';

const ActuationContext = React.createContext();

const ActuationProvider = (props) => {
  const [actuation, setActuation] = useState({
    history: [],
    historyIndex: -1,
    delta: null,
    mouseDown: false,
    drawing: false,
    startActuate: false,
    pinActuate: new Map([[0, new ActuationSequence(0, 'simple', 0)]]),
    currentStep: 0,
    simpleNum: 1,
  });

  return (
    <ActuationContext.Provider
      value={{
        actuation,
        setStartActuate: () => {
          setActuation((stateBoi) => ({ ...stateBoi, startActuate: !actuation.startActuate }));
        },
        actuatePin: (pinNum) => {
          const newList = actuation.pinActuate;
          newList.get(actuation.currentStep).actuatePin(pinNum);
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
        },
        setCurrentStep: (step) => {
          if (actuation.pinActuate.has(step) && actuation.pinActuate.get(step).type === 'loop') {
            step++;
          }
          if (!actuation.pinActuate.has(step)) {
            const newList = actuation.pinActuate;
            const newSeq = new ActuationSequence(step, 'simple', actuation.simpleNum);
            if (actuation.pinActuate.has(step - 1) && actuation.pinActuate.get(step - 1).type === 'simple') {
              actuation.pinActuate.get(step - 1).content.forEach((e) => {
                newSeq.content.add(e);
              });
            }
            newList.set(step, newSeq);
            setActuation((stateBoi) => (
              { ...stateBoi, pinActuate: newList, simpleNum: actuation.simpleNum + 1 }));
          }
          setActuation((stateBoi) => ({ ...stateBoi, currentStep: step }));
        },
        deleteCurrentStep: (step) => {
          if (actuation.pinActuate.size === 1) {
            return false;
          }
          if (actuation.pinActuate.has(step)) {
            const newList = actuation.pinActuate;
            if (newList.get(step).parent !== null) {
              const { parent } = newList.get(step);
              if (newList.get(parent).content.length === 1) {
                return false;
              }
              const ind = newList.get(parent).content.indexOf(step);
              newList.get(parent).content.splice(ind, 1);
            }
            newList.delete(step);
            let n = 0;
            newList.forEach((value, key) => {
              if (value.type === 'simple') {
                value.order = n;
                n++;
              }
            });
            const newStep = actuation.pinActuate.keys().next().value;
            setActuation((stateBoi) => ({
              ...stateBoi,
              pinActuate: newList,
              currentStep: newStep,
              simpleNum: actuation.simpleNum - 1,
            }));
          }
          return true;
        },
        insertStep: (obj) => {
          let newList = actuation.pinActuate;
          if (newList.get(actuation.currentStep).parent !== null) {
            const { parent } = newList.get(actuation.currentStep);
            newList.get(parent).content.push(obj.id);
            obj.parent = parent;
          }
          const arr = Array.from(newList);
          let index = 0;
          for (const e of arr) {
            if (e[1].id === actuation.currentStep) {
              break;
            }
            index++;
          }
          arr.splice(index + 1, 0, [obj.id, obj]);
          newList = new Map(arr);
          let n = 0;
          newList.forEach((value, key) => {
            if (value.type === 'simple') {
              value.order = n;
              n++;
            }
          });
          if (obj.parent !== null) {
            newList.get(obj.parent).content.sort((a, b) => {
              const ord1 = newList.get(a).order;
              const ord2 = newList.get(b).order;
              return ord1 - ord2;
            });
          }
          setActuation((stateBoi) => (
            { ...stateBoi, pinActuate: newList, simpleNum: actuation.simpleNum + 1 }));
        },
        addLoop: (from, to, repTime) => {
          const newList = actuation.pinActuate;
          const l = newList.size;
          const newSeq = new ActuationSequence(newList.size, 'loop');
          const content_list = [];
          let error = 0;
          newList.forEach((value, key) => {
            if (value.type === 'simple' && value.order >= from && value.order <= to) {
              if (error === 1) return;
              if (value.parent !== null) {
                error = 1;
                return;
              }
              content_list.push(value);
            }
          });
          if (error === 1) {
            return false;
          }
          if (content_list.length !== to - from + 1) {
            return false;
          }
          newSeq.pushAllSteps(content_list);
          newSeq.repTime = repTime;
          newList.set(l, newSeq);
          console.log(newList);
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
          return true;
        },
        updateLoop: (from, to, repTime, key) => {
          const newList = actuation.pinActuate;
          const seq = newList.get(key);
          const content_list = [];
          let error = 0;
          newList.forEach((value, key) => {
            if (value.type === 'simple' && value.order >= from && value.order <= to) {
              if (error === 1) return;
              if (value.parent !== null) {
                error = 1;
                return;
              }
              content_list.push(value);
            }
          });
          if (error === 1) {
            return false;
          }
          if (content_list.length !== to - from + 1) {
            return false;
          }
          seq.repTime = repTime;
          for (let i = 0; i < seq.content.length; i++) {
            actuation.pinActuate.get(seq.content[i]).parent = null;
          }
          seq.content = [];
          seq.pushAllSteps(content_list);
          console.log(newList);
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
          return true;
        },
        deleteLoop: (id) => {
          const newList = actuation.pinActuate;
          newList.get(id).content.forEach((e) => {
            newList.get(e).parent = null;
          });
          newList.delete(id);
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
        },
        pushHistory: (obj) => {
          const newHist = actuation.history;
          newHist.length = actuation.historyIndex + 1;
          newHist.push(obj);
          let newIndex = actuation.historyIndex + 1;
          if (newHist.length > 10) {
            newHist.shift();
            newIndex--;
          }
          setActuation((stateBoi) => ({ ...stateBoi, history: newHist, historyIndex: newIndex }));
        },
        clearAll: () => {
          setActuation((stateBoi) => ({
            ...stateBoi,
            pinActuate: new Map([[0, new ActuationSequence(0, 'simple', 0)]]),
            currentStep: 0,
            simpleNum: 1,
          }));
        },
        updateDuration: (key, time) => {
          const newList = actuation.pinActuate;
          newList.get(key).duration = time;
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
        },
        undo: () => {
          if (actuation.historyIndex > -1) {
            const obj = actuation.history[actuation.historyIndex];
            const newList = actuation.pinActuate;
            // {type: "actuate", pin: number, id: number, act: true}
            if (obj.type === 'actuate') {
              const seq = newList.get(obj.id);
              if (obj.act) {
                seq.content.delete(obj.pin);
              } else {
                seq.content.add(obj.pin);
              }
            }
            // to be continue
            setActuation((stateBoi) => ({
              ...stateBoi,
              pinActuate:
              newList,
              historyIndex: actuation.historyIndex - 1,
            }));
          }
        },
        redo: () => {
          if (actuation.historyIndex < actuation.history.length - 1) {
            const obj = actuation.history[actuation.historyIndex + 1];
            const newList = actuation.pinActuate;
            // {type: "actuate", pin: number, id: number, act: true}
            if (obj.type === 'actuate') {
              const seq = newList.get(obj.id);
              if (!obj.act) {
                seq.content.delete(obj.pin);
              } else {
                seq.content.add(obj.pin);
              }
            }
            // to be continue
            setActuation((stateBoi) => (
              { ...stateBoi, pinActuate: newList, historyIndex: actuation.historyIndex + 1 }));
          }
        },
      }}
    >
      {props.children}
    </ActuationContext.Provider>
  );
};

export { ActuationProvider, ActuationContext };
