import React, { Component } from "react"
import { CanvasProvider } from "./Contexts/CanvasProvider"
import { ActuationProvider } from "./Contexts/ActuationProvider"

import Canvas from "./Canvas/Canvas"
import Scroll from "./Scroll.js"
import { ControlPanel } from "./ControlPanel/ControlPanel"

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      mode: "CAN"// either "PIN", "SEQ", or "CAN"
    }
    this.setMode = this.setMode.bind(this)
  }

  setMode(type) {
    this.setState({ mode: type })
  }

  render() {
    const { mode } = this.state
    console.log(mode)
    return (
      <div className="App">
        <ActuationProvider>
          <CanvasProvider>
            <ControlPanel mode={mode} setMode={this.setMode} />
            <Canvas mode={mode} />
            <Scroll />
          </CanvasProvider>
        </ActuationProvider>
      </div>
    )
  }
}