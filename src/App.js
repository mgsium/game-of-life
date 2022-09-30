import './App.css';
import * as React from "react";

import $ from "jquery";

import Module from "grid-wasm/grid";
import { ChevronUp } from "react-feather";
import { saveAs, fileObj } from 'file-saver';

const CellColors = {
    Blue: "blue",
    Black: "slate",
    Red: "red"
};

const GridRow = (props) => {
    let blocks = [];

    for (let i = 0; i < 80; i++){
        const style = {
            minWidth: props.gridSize,
            height: props.gridSize
        };

        blocks.push(
          <td 
            // id={`${props.id}-${i}`} 
            key={i}
            style={style}
            className={
                props.grid.isActive(props.id, i) 
                && `bg-${props.cellColor}-600`
            }
            onClick={() => props.toggle(props.id, i)}
          ></td>
        )
    }
    return (
        <tr id={props.id}>
            {blocks}
        </tr>
    )
};

export default class Game extends React.Component {
    
    constructor(props) {
        super(props);

        /*Module.onRuntimeInitialized = async () => {
            const grid = new Module.Grid();
            grid.toggle(20, 9);
            grid.toggle(20, 10);
            grid.toggle(20, 11);
            grid.showGrid();
            grid.doTurn();
            grid.showGrid();
            console.log("Done!");
            this.setState({ grid: grid });
        };*/

        this.state = {
            isSimulating: false,
            cellColor: CellColors.Blue,
            speed: 100
        };
    }

    toggle = async (x, y) => {
        // Tiles can only be toggled when the
        // simulation is not running
        if (this.state.isSimulating) return;

        const grid = this.state.grid;
        grid.toggle(x, y);
        this.setState({ grid: grid });
    }

    start = () => {
        this.setState({ 
            interval: setInterval(
                this.doTurn,
                (100/this.state.speed) * 70
            )
        });
    }

    doTurn = () => {
        const grid = this.state.grid;
        grid.doTurn();
        this.setState({ grid: grid });
    }

    stop = () => {
        clearInterval(this.state.interval);
    }

    clearCells = () => {
        const grid = this.state.grid;
        grid.clearGrid();
        this.setState({ grid: grid });
    }

    loadTemplate = (t) => {
        const grid = this.state.grid;
        grid.loadTemplate(t);
        grid.showGrid();
        this.setState({ grid: grid });
    }

    componentDidMount() {
        Module().then(module => {
            const grid = new module.GameGrid();
            grid.toggle(20, 9);
            this.setState({ 
                grid: grid,
                templates: module.GridTemplate
            });
        });
    }

    updateSpeed = (e) => {
        this.setState({ speed: e.target.value });
        this.stop();
        this.start();
    }

    exportJSON = () => {
        console.log("Exporting...");
        const grid = this.state.grid;
        console.log(grid.exportGrid().split(","));

        var fileToSave = new Blob(
            [JSON.stringify({ activeCells: grid.exportGrid().split(",")})],
            {
                type: "application/json",
                name: "activeCells.json"
            }
        );
    
        saveAs(fileToSave, "activeCells.json")
    }


    importJSON = async (files) => {
        console.log("Importing...");
        if(this.state.isSimulating) this.stop();

        const file = files.item(0);
        console.log(file.type);
        if (file.type === "application/json"){
            let fileText = await file.text();
            console.log(fileText);
            fileObj = JSON.parse(fileText);
            console.log(fileObj);

            const grid = this.state.grid;
            grid.clearGrid();
            fileObj.activeCells.forEach((coords) => {
                coords = coords.split("-");
                grid.toggle(parseInt(coords[0]), parseInt(coords[1]));
            });
            this.setState({ grid: grid });
        } else {
            alert("\nYou chose an invalid file type.\nPlease upload a json file.")
        }
    }

    render(){
        if (!this.state.templates || !this.state.grid) return;

        let grid = [];
        for (let i = 0; i < 80; i++) grid.push(
            <GridRow 
                key={i} id={i} 
                gridSize={20}
                toggle={this.toggle}
                grid={this.state.grid}
                cellColor={this.state.cellColor}
            />
        );

        return (
            <>
                <nav id="main-navbar-top" class="navbar border-b-1 border-gray-200 bg-white" style={{ borderBottomWidth: 1 }}>
                    <a class="navbar-brand font-medium text-gray-700" href="#">Conway's Game of Life</a>
                    <div style={{ float: "right" }} class="flex divide-x">
                        <div class="flex gap-2 mx-1.5">
                            <button 
                                class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                                onClick={this.exportJSON}
                            >Export</button>
                            <button
                                class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                                onClick={() => $('#file-upload-btn').trigger("click")}
                            >Import</button>
                            <input 
                                id="file-upload-btn" 
                                type="file" 
                                style={{ display: "none" }} 
                                onChange={ (event) => this.importJSON(event.target.files) }
                            />
                        </div>
                        <div class="text-slate-500 flex items-center">
                            <a href="https://github.com/mgsium/game-of-life" class="hover:!text-slate-600">
                                <svg viewBox="0 0 16 16" class="w-7 h-7 mx-2 mb-0.5" fill="currentColor" aria-hidden="true">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </nav>
                <div 
                    className="bg-gray-100" 
                    style={{ 
                        height: "calc(100vh - 114px)",
                        overflow: "scroll",
                        position: "relative",
                        top: 57
                    }}
                >
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
                            type="range" min="10" max="200" 
                            defaultValue={this.state.speed} 
                            id="sizeRange" onChange={this.updateSpeed}
                            className="bg-gray-900"
                            style={{ 
                                position: "relative", 
                                top: 2, left: 20 
                            }}
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
                                !this.state.isSimulating ? this.start() : this.stop();
                                this.setState({isSimulating: !this.state.isSimulating});
                            }}
                        >
                            { this.state.isSimulating ? "Stop" : "Start" }
                        </button>
                        <button 
                            class="bg-indigo-500 hover:bg-indigo-600 text-slate-50 border-solid border-1 border-indigo-200 rounded px-3 py-1.5" 
                            onClick={this.clearCells}
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
                            <a className="dropdown-item" id="glider-gun" href="#" onClick={() => this.loadTemplate(this.state.templates.GLIDER_GUN)}>Glider Gun</a>
                            <a className="dropdown-item" id="bi-gun" href="#" onClick={() => this.loadTemplate(this.state.templates.BI_GUN)}>Bi Gun</a>
                            <a className="dropdown-item" id="ak-94" href="#" onClick={() => this.loadTemplate(this.state.templates.AK94)}>AK-94</a>
                            <a className="dropdown-item" id="simkin-glider-gun" href="#" onClick={() => this.loadTemplate(this.state.templates.SIMKIN_GLIDER_GUN)}>Simkin Glider Gun</a>
                            <a className="dropdown-item" id="pipe-dreams" href="#" onClick={() => this.loadTemplate(this.state.templates.PIPE_DREAMS)}>Piping</a>
                        </div>
                        {
                            [
                                [CellColors.Black, "Black", "slate"],
                                [CellColors.Blue, "Blue", "blue"],
                                [CellColors.Red, "Red", "red"]
                            ].map(([f, y, z]) => <button 
                                className={`rounded !h-10 !w-10 bg-${z}-500 hover:bg-${z}-600`}
                                onClick={() => this.setState({ cellColor: f })}
                            ></button>)
                        }
                    </div>
                </nav>
            </>
        );
    }

}
