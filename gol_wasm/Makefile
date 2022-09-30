# -*- Makefile -*-

OPTIMIZE=

all: grid

grid: format
	emcc -lembind -o grid.js ${OPTIMIZE}\
	-s "EXPORTED_RUNTIME_METHODS=['addOnPostRun']" \
	-s ENVIRONMENT=web \
	-s MODULARIZE=1 \
	-s EXPORT_ES6=1 \
	main.cpp

clean:
	rm -f *.out *.js

format:
	find . -iname *.h -o -iname *.cpp | xargs clang-format -i
