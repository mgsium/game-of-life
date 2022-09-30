#ifndef MAIN_H_
#define MAIN_H_

#include <array>
#include <cstdio>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <utility>
#include <vector>

#define GRIDSIZE 80

typedef std::array<std::array<int, GRIDSIZE>, GRIDSIZE> GridValues;

enum GridTemplate { GLIDER_GUN, BI_GUN, AK94, SIMKIN_GLIDER_GUN, PIPE_DREAMS };

class Grid {
public:
  Grid() {}
  bool isActive(int x, int y);
  void toggle(int x, int y);
  void setGrid(GridValues newgrid);
  void clearGrid();
  void doTurn();
  void showGrid();
  void loadTemplate(GridTemplate gt);
  std::string exportGrid();

private:
  GridValues grid = {};
  void doTurnCell(int x, int y, GridValues &newgrid);
  GridValues fillGrid(std::vector<std::pair<int, int>> activeCells,
                      std::pair<int, int> offset);
};

#endif // MAIN_H_
