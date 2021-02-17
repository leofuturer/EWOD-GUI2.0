import React, { Component } from "react"
import Provider from "./Provider";
import { Canvas } from "./Canvas/Canvas.js"
import { ControlPanel } from "./ControlPanel/ControlPanel"

export default class App extends Component {

  render() {
    return (
      <div className="App">
        <Provider>
          <ControlPanel />
          <Canvas />
        </Provider>
      </div>
    )
  }
}