# GameOfLifeVisualisation

A web app simulating a model of Conway's Game of Life built using React, my own [VisualisationJs][VisJS_link] library and the [dragscroll][dragscrolljs_link] library by asvd.


Visit https://gameoflifeneo.co.uk

![image](https://user-images.githubusercontent.com/46031748/104137499-215e6900-5395-11eb-8a6a-9641d31ce5ef.png)

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