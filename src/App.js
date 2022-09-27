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
                            type="range" min="10" max="60" 
                            defaultValue="40" 
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