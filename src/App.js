import logo from './logo.svg';
import './App.css';
import { Visualisation } from './Visualisation.js';

import $ from "jquery";
import * as React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronUp } from "react-feather";

// creates an instace of the Visualisation class


// colour panel click handlers

const GridRow = (props) => {
    let blocks = [];
    for (let i = 0; i < 150; i++){
        blocks.push(
          <td 
            id={`${props.id}-${i}`} 
            style={{
              minWidth: props.gridSize,
              height: props.gridSize
            }}
            onClick={() => props.cellHandler(`${props.id}-${i}`)}
          ></td>
        )
    }
    return (
        <tr id={props.id}>
            {blocks}
        </tr>
    )
}

export default class GameGrid extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            gridSize: 20,
            isSimulating: false,
            game: new Visualisation()
        }

        this.getSliderVal = this.getSliderVal.bind(this);
        this.changeBlockSize = this.changeBlockSize.bind(this);
    }

    houseBlue = () => this.setHouseColor("blue");
    houseRed = () => this.setHouseColor("red");
    houseGreen = () => this.setHouseColor("green");

    setHouseColor = (color) => { 
      const Game = this.state.game;
      Game.houseChoice = `house-${color}`; 
      Game.clearHouseColours();
      this.setState({ game: Game });
    }

    cellHandler = (id) => {
      $(`#${id}`).toggleClass(this.state.game.houseChoice);
      if (this.state.game.houses.includes(id)) this.state.game.removeHouse(id);
      else this.state.game.addHouse(id);
    }

    async getSliderVal(){
        const slider = document.getElementById("sizeRange");
        const Game = this.state.game;
        Game.visSpeed = parseInt(slider.value);
        this.setState({ game: Game });
    }

    changeBlockSize(event){
        let sizeStr = event.target.id.substring(0, 2);
        this.setState({"gridSize": parseInt(sizeStr)})
    }

    render(){
        let grid = [];
        for (let i = 80; i > 0; i--)
            grid.push(<GridRow 
              key={i} id={i} 
              gridSize={this.state.gridSize}
              cellHandler={this.cellHandler}
            />);

        return (
          <>
                <nav id="main-navbar-top" class="navbar border-b-1 border-gray-200 bg-white" style={{ borderBottomWidth: 1 }}>
                    <a class="navbar-brand font-medium text-gray-700" href="#">Conway's Game of Life</a>
                    <div style={{ float: "right" }} class="flex divide-x">
                        <div class="flex gap-2 mx-1.5">
                            <button 
                                class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                                onClick={() => this.state.game.exportJSON()}
                            >Export</button>
                            <button
                                class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                                onClick={() => $('#file-upload-btn').trigger("click")}
                            >Import</button>
                            <input 
                                id="file-upload-btn" 
                                type="file" 
                                style={{ display: "none" }} 
                                onChange={ (event) => this.state.game.importJSON(event.target.files) }
                            />
                        </div>
                        <div class="text-slate-500 flex items-center">
                            <a href="https://github.com/mgsium/GameOfLifeVisualisation" class="hover:!text-slate-600">
                                <svg viewBox="0 0 16 16" class="w-7 h-7 mx-2 mb-0.5" fill="currentColor" aria-hidden="true">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </nav>
                <div className="dragscroll bg-gray-100">
                    <table>
                        <tbody>
                            {grid}
                        </tbody>
                    </table>
                </div>
                <nav 
                    id="toolbar" 
                    className="navbar bg-white border-t-1 border-gray-200 flex items-baseline jusify-around" 
                    style={{ "border-top-width": "1px", width: "100%" }}
                >
                    <div className="flex-1">
                        <span style={{"color": "grey"}}>Speed Control</span>
                        <input 
                            type="range" min="10" max="300" 
                            defaultValue="150" 
                            id="sizeRange" onChange={this.getSliderVal}
                            className="bg-gray-900"
                            style={{ "position": "relative", "top": "-4px", "left": "20px" }}
                        />
                    </div>
                    <div className="btn-group btn-group-toggle radio-btn flex-1" hidden>
                        <label className="btn btn-sm btn-info">
                            <input type="radio" name="colour" autoComplete="off" disabled/><small>Block Size</small>
                        </label>
                        <label className="btn btn-sm btn-primary">
                            <input type="radio" id="10px" autoComplete="off" onClick={this.changeBlockSize}/>10px
                        </label>
                        <label className="btn btn-sm btn-primary">
                            <input type="radio" id="20px" autoComplete="on" onClick={this.changeBlockSize}/>20px
                        </label>
                        <label className="btn btn-sm btn-primary">
                            <input type="radio" id="30px" autoComplete="off" onClick={this.changeBlockSize}/>30px
                        </label>
                    </div>
                    <div className="flex-1 flex justify-center gap-2">
                        <button 
                            type="button" 
                            class={ (!this.state.isSimulating ? "bg-indigo-500 hover:bg-indigo-600" : "bg-red-500 hover:bg-red-600") 
                                + " text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                            }
                            onClick={() => {
                                if (!this.state.isSimulating) this.state.game.Simulate.bind(this.state.game)();
                                else this.state.game.stopSimulation.bind(this.state.game)();
                                this.setState({isSimulating: !this.state.isSimulating});
                            }}
                        >
                            { this.state.isSimulating ? "Stop" : "Start" }
                        </button>
                        <button 
                            class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                            onClick={this.state.game.clearHouses}
                        >Clear</button>
                    </div>
                    <div className="dropup flex-1 justify-end flex gap-2">
                        <button 
                            class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5 flex items-center" 
                            type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                        >
                            Templates&nbsp;
                            <span style={{ display: "inline-block" }}>
                                <ChevronUp/>
                            </span>
                        </button>
                        <div className="dropdown-menu absolute" style={{ "position": "absolute", "left": "unset", right: "100px" }}>
                            <a className="dropdown-item" id="glider-gun" href="#" onClick={this.state.game.loadTemplate}>Glider Gun</a>
                            <a className="dropdown-item" id="bi-gun" href="#" onClick={this.state.game.loadTemplate}>Bi Gun</a>
                            <a className="dropdown-item" id="ak-94" href="#" onClick={this.state.game.loadTemplate}>AK-94</a>
                            <a className="dropdown-item" id="simkin-glider-gun" href="#" onClick={this.state.game.loadTemplate}>Simkin Glider Gun</a>
                            <a className="dropdown-item" id="pipe-dreams" href="#" onClick={this.state.game.loadTemplate}>Piping</a>
                        </div>
                        {
                            [
                                [this.houseGreen, "Green", "green"],
                                [this.houseBlue, "Blue", "blue"],
                                [this.houseRed, "Red", "red"]
                            ].map(([f, y, z]) => <button 
                                className={`rounded !h-10 !w-10 bg-${z}-500 hover:bg-${z}-600`}
                                onClick={f}
                            ></button>)
                        }
                    </div>
                </nav>
              </>
        )
    }
}