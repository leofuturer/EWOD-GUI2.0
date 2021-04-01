export default class ActuationSequence{
  constructor(id, type, order=0){
    this.id = id;
    this.type = type;
    this.content = type==="simple"?new Set():[];
    this.repTime = 1;
    this.parent = null;
    this.order = order;
  }    
  actuatePin(pinNum){
    if(this.type==="loop") console.log('loop type cannot be actuated');
    else if(this.content.has(pinNum)){
      this.content.delete(pinNum)
    }else{
      this.content.add(pinNum);
    }
  }
  pushAllSteps(stepArray){
    if(this.type === "simple") console.log('simple type cannot contain sequence');
    else{
      stepArray.forEach((e)=>{
        e.parent = this.id;
        this.content.push(e.id);
      });
    }
  }
  pushOneStep(step){
    if(this.type === "simple") console.log('simple type cannot contain sequence');
    else {
      step.parent = this.id;
      this.content.push(step.id);
    }
  }
}