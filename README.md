# Conway's Game of Life

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web app simulating a model of Conway's Game of Life, a cellular automata game. 

Visit https://gameoflife.mgsium.com to play.

#### Table of Contents

1. [What is Conway's Game of Life?](#what-is-conways-game-of-life)
    - [Rules](#rules)
2. [Contributing](#contributing)

---

![Demo Image](https://user-images.githubusercontent.com/46031748/193268952-efaad4b3-13d7-4b95-9953-dddadeef189b.png)

[dragscrolljs_link]: https://github.com/asvd/dragscroll
[VisJS_link]: https://github.com/mgsium/VisualisationJs

---

### What is Conway's Game of Life?

From the [wikipedia article](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life): 

> The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970. It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.

> The universe of the Game of Life is an infinite, two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, live or dead (or populated and unpopulated, respectively). Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent.

##### Rules

The matrix below details how the state of a cell in the next generation is determined.

e.g. If a cell is currenly alive, and has 2 neighbours, it remians alive in the next generation.
However, if a cell is dead, it must have exactly 3 neighbours to be born (alive in the next generation).

|               | Alive       | Dead         |
|---------------|----------   |--------------|
| >=1 neighbour | Dies &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🟥 | Stays Dead &nbsp; 🟥 |
| 2 neighbours  | Survives &nbsp; 🟩 | Stays Dead &nbsp; 🟥 |
| 3 neighbours  | Survives &nbsp; 🟩 | Born &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&emsp;&emsp; 🟩 |
| 4 neighbours  | Dies &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🟥 | Stays Dead &nbsp; 🟥 |

---

### Contributing

#### **Dependencies**

As well as the general dependency GNU make, work on C++ will require [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) and work on the react project will require [nodejs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### **Building from Source**

Source C++ code can be found in `/gol_wasm`

Running `make` in `/gol_wasm` compiles the source C++ to a `grid.js` file.

(Use the `emcc` compiler directly to compile to web assembly.)

Running `make` at the project root does the above, moves the output wasm files to `./node_modules/grid-wasm/` and builds the react project to `/build`.
