all: react

react: grid
	npm run build

grid:
	$(MAKE) -C gol_wasm
	mv gol_wasm/grid.js ./node_modules/grid-wasm/
	mv gol_wasm/grid.wasm ./node_modules/grid-wasm/