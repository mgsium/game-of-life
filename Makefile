all: react

react: grid
	npm run build

grid:
	$(MAKE) -C gol_wasm
	cp gol_wasm/grid.js src/