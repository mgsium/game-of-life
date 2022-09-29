#ifndef MAIN_H_
#define MAIN_H_


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
  void loadTemplate(int gt);

private:
  GridValues grid = {};
  void doTurnCell(int x, int y, GridValues &newgrid);
  GridValues fillGrid(std::vector<std::pair<int, int>> activeCells);
};

#endif // MAIN_H_
