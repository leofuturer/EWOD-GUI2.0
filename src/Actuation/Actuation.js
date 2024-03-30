/* eslint-disable linebreak-style */
import { setPin } from '../USBCommunication/USBCommunication';

export default class ActuationSequence {
  constructor(id, type, order = 0) {
    this.id = id;
    this.type = type;
    this.content = type === 'simple' ? new Set() : [];
    this.repTime = 1;
    this.parent = null;
    this.order = order;
    this.duration = 100;
  }

  actuatePin(pinNum) {
    if (this.type === 'loop') console.log('loop type cannot be actuated');
    else if (this.content.has(pinNum)) {
      this.content.delete(pinNum);
      setPin([pinNum], 0);
    } else {
      this.content.add(pinNum);
      setPin([pinNum], 1);
    }
  }

  pushAllSteps(stepArray) {
    if (this.type === 'simple') console.log('simple type cannot contain sequence');
    else {
      stepArray.forEach((e) => {
        e.parent = this.id;
        this.content.push(e.id);
      });
    }
  }

  pushOneStep(initstep) {
    const step = initstep;
    if (this.type === 'simple') console.log('simple type cannot contain sequence');
    else {
      step.parent = this.id;
      this.content.push(step.id);
    }
  }
}
