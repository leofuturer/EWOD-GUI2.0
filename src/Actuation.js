export default class ActuationSequence{
    constructor(map, seq){
      this.map = map;
      this.seq = seq;
      this.timestamp = (!seq)?0:seq.length;
      this.current = this.timestamp;
    }
  
    assignPin(pin, key){
      this.map.set(pin, key);
    }
    
    actuatePin(pin, time){
      if(time<1||time>this.timestamp) throw "not an available time";
      else{
        this.seq[time-1] = this.seq[time-1].add(pin);
      }
    }
    deactuatePin(pin, time){
        if(time<1||time>this.timestamp) throw "not an available time";
      else{
        this.seq[time-1].delete(pin);
      }
    }
    activateAt(pin, time){
      if(time<0||time>this.timestamp) throw "not an available time";
      return this.seq[time-1].has(pin);
    }
  
    activatedAtTime(time){
      let arr = [];
      this.seq[time-1].forEach(ele =>{
        arr.push(ele);
      });
      return arr;
      //or return this.seq[time] directly
    }
    
    activatedForPin(pin){
      let arr = [];
      this.seq.forEach(ele =>{
        let next = ele.has(pin)?1:0;
        arr.push(next);
      });
      return arr;
    }
    
    getLastTime(){ return this.timestamp; }
    getPinMapping(){ return this.map; } 
    addTime(){ 
        this.seq.push(new Set());
        this.current++; 
        return ++this.timestamp;
    } 
    removePin(pin){
      if(this.map.has(pin)){
        this.map.delete(pin);
        this.seq.forEach(ele => {
          if(ele.has(pin)) ele.delete(pin);
        });
      }else{
        throw "pin does not exist";
      }
    }
    formatString(){
      let res = "";
      if(this.map.size>0){
        this.map.forEach(function(value, key){
          res+=`square ${parseInt(key/3)} ${key%3} ${value}\n`;
        });
      }
      res+="#ENDOFLAYOUT#\n";
      this.seq.forEach((value, index)=>{
        let substring = "";
        value.forEach((e)=>{
          substring+=`${e},`;
        });
        substring = substring.slice(0, -1);
        substring+=";100\n";
        res+=substring;
      });
      res+="#ENDOFSEQUENCE#\n#ENDOFREPEAT#\n";
      return res;
    }
  }