import React, { useState, useEffect } from 'react';
import ActuationSequence from '../Actuation/Actuation';
import db from './DBStorage';
import useInterval from '../useInterval';
import handleSave from '../ControlPanel/handleSave';

const ActuationContext = React.createContext();

const ActuationProvider = ({ children }) => {
  const [actuation, setActuation] = useState({
    history: [],
    historyIndex: -1,
    pinActuate: new Map([[0, new ActuationSequence(0, 'simple', 0)]]),
    currentStep: 0,
    simpleNum: 1,
  });

  useEffect(
    () => {
      db.transaction('rw', db.formData, async () => {
        const act = await db.formData.get('actuation');
        if (!act) {
          await db.formData.add({ id: 'actuation', value: [] });
          await db.formData.add({ id: 'contents', value: [] });
        } else {
          const contents = await db.formData.get('contents');
          const newList = new Map();
          const oldMap = new Map(JSON.parse(act.value[0]));
          let i = 0;
          oldMap.forEach((value) => {
            const newSeq = new ActuationSequence(value.id, value.type, value.order);
            newSeq.duration = value.duration;
            newSeq.parent = value.parent;
            newSeq.repTime = value.repTime;
            if (value.type === 'simple') {
              contents.value[i].forEach((e) => newSeq.content.add(e));
            } else {
              contents.value[i].forEach((e) => newSeq.content.push(e));
            }
            newList.set(value.id, newSeq);
            i += 1;
          });
          console.log(newList);
          setActuation((stateBoi) => ({
            ...stateBoi,
            pinActuate: newList,
            simpleNum: newList.size,
          }));
        }
      }).catch((e) => console.log(e.stack || e));
    },
    [db],
  );

  useInterval(() => {
    handleSave(null, null, actuation.pinActuate, null, null, db);
  }, 10000);

  return (
    <ActuationContext.Provider
      value={{
        actuation,
        actuatePin: (pinNum) => {
          const newList = actuation.pinActuate;
          newList.get(actuation.currentStep).actuatePin(pinNum);
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
        },
        setPinActuation: (map) => {
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: map }));
        },
        setSimpleNum: (num) => {
          setActuation((stateBoi) => ({ ...stateBoi, simpleNum: num }));
        },
        setCurrentStep: (initstep) => {
          let step = initstep;
          if (actuation.pinActuate.has(step) && actuation.pinActuate.get(step).type === 'loop') {
            step += 1;
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
            setActuation((stateBoi) => ({
              ...stateBoi,
              pinActuate:
                newList,
              simpleNum: actuation.simpleNum + 1,
            }));
          }
          setActuation((stateBoi) => ({ ...stateBoi, currentStep: step }));
        },
        deleteCurrentStep: (step) => {
          if (actuation.pinActuate.size === 1) {
            return false;
          }
          if (actuation.pinActuate.has(step)) {
            const newList = actuation.pinActuate;
            if (newList.get(step).parent) {
              const { parent } = newList.get(step);
              if (newList.get(parent).content.length === 1) {
                return false;
              }
              const ind = newList.get(parent).content.indexOf(step);
              newList.get(parent).content.splice(ind, 1);
            }
            newList.delete(step);
            let n = 0;
            newList.forEach((initvalue) => {
              const value = initvalue;
              if (value.type === 'simple') {
                value.order = n;
                n += 1;
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
        insertStep: (initobj) => {
          const obj = initobj;
          let newList = actuation.pinActuate;
          if (newList.get(actuation.currentStep).parent) {
            const { parent } = newList.get(actuation.currentStep);
            newList.get(parent).content.push(obj.id);
            obj.parent = parent;
          }
          const arr = Array.from(newList);
          const index = arr.findIndex((e) => e[1].id === actuation.currentStep);
          arr.splice(index + 1, 0, [obj.id, obj]);
          newList = new Map(arr);
          let n = 0;
          newList.forEach((initvalue) => {
            const value = initvalue;
            if (value.type === 'simple') {
              value.order = n;
              n += 1;
            }
          });
          if (obj.parent) {
            newList.get(obj.parent).content.sort((a, b) => {
              const ord1 = newList.get(a).order;
              const ord2 = newList.get(b).order;
              return ord1 - ord2;
            });
          }
          setActuation((stateBoi) => ({
            ...stateBoi,
            pinActuate: newList,
            currentStep: obj.id,
            simpleNum: actuation.simpleNum + 1,
          }));
        },
        addLoop: (from, to, repTime) => {
          const newList = actuation.pinActuate;
          const key = Math.max(...newList.keys());
          const newSeq = new ActuationSequence(key + 1, 'loop');
          const contentList = [];
          let error = 0;
          newList.forEach((value) => {
            if (value.type === 'simple' && value.order >= from - 1 && value.order <= to - 1) {
              if (error === 1) return;
              if (value.parent) {
                error = 1;
                return;
              }
              contentList.push(value);
            }
          });
          if (error === 1) {
            return false;
          }
          if (contentList.length !== to - from + 1) {
            return false;
          }
          newSeq.pushAllSteps(contentList);
          newSeq.repTime = repTime;
          newList.set(key + 1, newSeq);
          console.log(newList);
          setActuation((stateBoi) => ({ ...stateBoi, pinActuate: newList }));
          return true;
        },
        updateLoop: (from, to, repTime, loopKey) => {
          const newList = actuation.pinActuate;
          const seq = newList.get(loopKey);
          const contentList = [];
          let error = 0;
          newList.forEach((value) => {
            if (value.type === 'simple' && value.order >= from - 1 && value.order <= to - 1) {
              if (error === 1) return;
              if (value.parent && value.parent !== loopKey) {
                error = 1;
                return;
              }
              contentList.push(value);
            }
          });
          if (error === 1) {
            return false;
          }
          if (contentList.length !== to - from + 1) {
            return false;
          }
          seq.repTime = repTime;
          for (let i = 0; i < seq.content.length; i += 1) {
            actuation.pinActuate.get(seq.content[i]).parent = null;
          }
          seq.content = [];
          seq.pushAllSteps(contentList);
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
            newIndex -= 1;
          }
          setActuation((stateBoi) => ({ ...stateBoi, history: newHist, historyIndex: newIndex }));
        },
        clearAll: () => {
          setActuation((stateBoi) => ({
            ...stateBoi,
            history: [],
            historyIndex: -1,
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
        updateAllDuration: (time) => {
          const newList = actuation.pinActuate;
          newList.forEach((initvalue) => {
            const value = initvalue;
            value.duration = time;
          });
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
            setActuation((stateBoi) => ({
              ...stateBoi,
              pinActuate: newList,
              historyIndex: actuation.historyIndex + 1,
            }));
          }
        },
      }}
    >
      {children}
    </ActuationContext.Provider>
  );
};

export { ActuationProvider, ActuationContext };
