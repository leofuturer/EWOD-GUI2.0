import './App.css';
import React, { Component } from "react"
import DragSelect from "dragselect"
import Dexie from "dexie"

import { Canvas } from "./Canvas.js"

const numCols = 5
const numRows = 5
const numButtons = numCols * numRows

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      boxSelectHist: new Array(numButtons).fill(0),
      // every box needs to keep track of whether it's been selected
    }
    this.onElemSel = this.onElemSel.bind(this)
    this.combiUnselect = this.combiUnselect.bind(this)
  }
  componentDidMount() {
    // let dragThing = new DragSelect({
    //   selectables: document.querySelectorAll('.item'),
    //   area: document.querySelector("div.wrapper"),
    //   // callback: e => console.log(e)
    // });
    // dragThing.subscribe("elementselect", (elem) => this.onElemSel(elem))
  }
  onElemSel(elem) {
    // console.log(elem)
    // elem = elem.target
    let currHist = this.state.boxSelectHist
    let idx = Number(elem.innerText)
    currHist[idx] = !currHist[idx]
    this.setState({ boxSelectHist: currHist })
  }

  combiUnselect(newHist) {
    this.setState({ boxSelectHist: newHist })
  }

  render() {
    let { boxSelectHist } = this.state

    return (
      <div className="App">
        {/* <div className="wrapper">
          {
            boxSelectHist.map((boxSelected, idx) => {
              let color = "#c5c5c5"
              if (boxSelected)
                color = "#a0b2c4"
              return (<button type="button" className="item" style={{ backgroundColor: color }} key={idx}>{idx}</button>)
            })
          }
        </div> */}

        <Canvas combiUnselect={this.combiUnselect} db={new Dexie('ElecDB')} />
      </div>
    )
  }
}