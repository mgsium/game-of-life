# -*- Makefile -*-


all: grid

grid: format
	emcc -lembind -o grid.js -s "EXPORTED_RUNTIME_METHODS=['addOnPostRun']" -s ENVIRONMENT=web -s MODULARIZE=1 -s WASM=0 main.cpp

clean:
	rm -f *.out *.js

format:
	find . -iname *.h -o -iname *.cpp | xargs clang-format -i
