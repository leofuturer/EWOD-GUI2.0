import './App.css';
import React, { Component } from "react"
import Provider from "./Provider";

import { Canvas } from "./Canvas.js"
import Scroll from "./Scroll.js"
import { ControlPanel } from "./ControlPanel/ControlPanel"

export default class App extends Component {
  render() {

    return (
      <div className="App">
        <Provider>
          <ControlPanel />
          <Canvas />
          <Scroll />
        </Provider>
      </div>
    )
  }
}