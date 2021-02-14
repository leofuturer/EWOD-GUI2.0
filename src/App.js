import './App.css';
import React, { Component } from "react"
import Dexie from "dexie"
import Provider from "./Provider";

import { Canvas } from "./Canvas.js"
import Scroll from "./Scroll.js"

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
    this.combiUnselect = this.combiUnselect.bind(this)
  }

  combiUnselect(newHist) {
    this.setState({ boxSelectHist: newHist })
  }

  render() {

    return (
      <div className="App">
        <Provider>
          <Canvas combiUnselect={this.combiUnselect} db={new Dexie('ElecDB')} />
          <Scroll/>
        </Provider>
      </div>
    )
  }
}