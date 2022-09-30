# GameOfLifeVisualisation

A web app simulating a model of Conway's Game of Life.

Visit https://gameoflife.mgsium.com to play.

![Demo Image](https://user-images.githubusercontent.com/46031748/193268952-efaad4b3-13d7-4b95-9953-dddadeef189b.png)

[dragscrolljs_link]: https://github.com/asvd/dragscroll
[VisJS_link]: https://github.com/mgsium/VisualisationJs

---

### Contributing

#### **Dependencies**

As well as the general dependency GNU make, work on C++ will require [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) and work on the react project will require [nodejs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### **Building from Source**

Source C++ code can be found in `/gol_wasm`

Running `make` in `/gol_wasm` compiles the source C++ to a `grid.js` file.

(Use the `emcc` compiler directly to compile to web assembly.)

Running `make` at the project root does the above, copies `grid.js` to `/src` and builds the react project to `/build`.
