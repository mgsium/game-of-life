#include "main.h"
#include <array>
#include <cstdio>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <utility>
#include <vector>

using namespace emscripten;

// Check if a cell is active/
bool Grid::isActive(int x, int y) { return this->grid[x][y]; }

// Toggle the activity status of a cell
void Grid::toggle(int x, int y) { this->grid[x][y] = !this->grid[x][y]; }

// Set a new grid
void Grid::setGrid(GridValues newgrid) { this->grid = newgrid; }

// Make all cells in the grid inactive
void Grid::clearGrid() {
  GridValues newgrid = {};
  this->setGrid(newgrid);
}

// Perform one turn of the game of life
// for the whole grid
void Grid::doTurn() {
  GridValues newgrid;

  for (int i = 0; i < GRIDSIZE; i++) {
    for (int j = 0; j < GRIDSIZE; j++) {
      this->doTurnCell(i, j, newgrid);
    }
  }

  this->grid = newgrid;
}

// Perform one turn of the game of life
// for a single cell
void Grid::doTurnCell(int i, int j, GridValues &newgrid) {
  int neighbours = 0;

  int indicesToCheck[8][2] = {{0, 1},  {0, -1}, {1, 0},  {1, 1},
                              {1, -1}, {-1, 0}, {-1, 1}, {-1, -1}};

  for (int k = 0; k < 8; k++) {
    int ip = indicesToCheck[k][0];
    int jp = indicesToCheck[k][1];
    if (!((i + ip) < 0 || (j + jp) < 0) &&
        !((i + ip) >= GRIDSIZE || (j + jp) >= GRIDSIZE) &&
        this->isActive(i + ip, j + jp))
      neighbours++;
  }

  if (neighbours == 3 || (neighbours == 2 && this->isActive(i, j)))
    newgrid[i][j] = true;
  else
    newgrid[i][j] = false;
}

// Display the current grid
void Grid::showGrid() {
  printf("\nGRID\n---------------------------\n");
  for (int i = 0; i < GRIDSIZE; i++) {
    for (int j = 0; j < GRIDSIZE; j++) {
      printf("%s ", (this->isActive(i, j) ? "x" : "o"));
    }
    printf("\n");
  }
  printf("\n");
}

// Load a preset grid template
void Grid::loadTemplate(GridTemplate gt) {
  printf("Loading Template...\n");
  std::vector<std::pair<int, int>> activeCellsV;
  std::pair<int, int> offset(0, 0);

  switch (gt) {
  case GLIDER_GUN:
    activeCellsV = {{69, 6},  {68, 6},  {68, 7},  {69, 7},  {69, 16}, {68, 16},
                    {67, 16}, {70, 17}, {71, 18}, {71, 19}, {66, 17}, {65, 18},
                    {65, 19}, {68, 20}, {70, 21}, {69, 22}, {68, 22}, {67, 22},
                    {66, 21}, {68, 23}, {69, 26}, {69, 27}, {70, 27}, {70, 26},
                    {71, 26}, {71, 27}, {72, 28}, {68, 28}, {72, 30}, {73, 30},
                    {68, 30}, {67, 30}, {71, 40}, {71, 41}, {70, 41}, {70, 40}};
    offset.first = 10;
    offset.second = -10;
    this->setGrid(this->fillGrid(activeCellsV, offset));
    break;
  case BI_GUN:
    activeCellsV = {{59, 7},  {58, 7},  {59, 8},  {58, 8},  {59, 16}, {59, 17},
                    {60, 17}, {58, 17}, {58, 18}, {60, 18}, {57, 18}, {60, 21},
                    {64, 21}, {64, 17}, {66, 17}, {64, 18}, {65, 17}, {65, 16},
                    {66, 18}, {67, 18}, {64, 22}, {60, 22}, {60, 41}, {60, 42},
                    {60, 45}, {60, 46}, {61, 46}, {62, 46}, {61, 47}, {63, 45},
                    {62, 45}, {56, 41}, {56, 42}, {56, 45}, {56, 46}, {55, 46},
                    {54, 46}, {54, 45}, {55, 47}, {53, 45}, {61, 55}, {62, 55},
                    {62, 56}, {61, 56}};
    this->setGrid(this->fillGrid(activeCellsV, offset));
    break;
  case AK94:
    activeCellsV = {{59, 7},  {58, 7},  {59, 8},  {58, 8},  {59, 16}, {59, 17},
                    {60, 17}, {58, 17}, {58, 18}, {60, 18}, {57, 18}, {60, 21},
                    {64, 21}, {64, 17}, {66, 17}, {64, 18}, {65, 17}, {65, 16},
                    {66, 18}, {67, 18}, {64, 22}, {60, 22}, {60, 41}, {60, 42},
                    {60, 45}, {60, 46}, {61, 46}, {62, 46}, {61, 47}, {63, 45},
                    {62, 45}, {56, 41}, {56, 42}, {56, 45}, {56, 46}, {55, 46},
                    {54, 46}, {54, 45}, {55, 47}, {53, 45}, {61, 55}, {62, 55},
                    {62, 56}, {61, 56}};
    this->setGrid(this->fillGrid(activeCellsV, offset));
    break;
  case SIMKIN_GLIDER_GUN:
    activeCellsV = {{71, 6},  {70, 6},  {70, 7},  {71, 7},  {68, 10}, {68, 11},
                    {67, 11}, {67, 10}, {70, 13}, {71, 13}, {71, 14}, {70, 14},
                    {62, 28}, {61, 27}, {60, 27}, {59, 27}, {59, 28}, {59, 29},
                    {62, 29}, {62, 31}, {62, 32}, {61, 33}, {60, 34}, {59, 33},
                    {58, 32}, {60, 37}, {60, 38}, {59, 38}, {59, 37}, {54, 27},
                    {54, 26}, {53, 26}, {52, 27}, {52, 28}, {52, 29}, {51, 29}};
    this->setGrid(this->fillGrid(activeCellsV, offset));
    break;
  case PIPE_DREAMS:
    activeCellsV = {
        {73, 15}, {73, 16}, {73, 21}, {73, 22}, {73, 25}, {73, 26}, {73, 31},
        {73, 32}, {73, 35}, {73, 36}, {73, 41}, {73, 42}, {73, 45}, {73, 46},
        {73, 51}, {73, 52}, {73, 55}, {73, 56}, {73, 61}, {73, 62}, {73, 65},
        {73, 66}, {73, 71}, {73, 72}, {72, 15}, {72, 17}, {72, 20}, {72, 22},
        {72, 25}, {72, 27}, {72, 30}, {72, 32}, {72, 35}, {72, 37}, {72, 40},
        {72, 42}, {72, 45}, {72, 47}, {72, 50}, {72, 52}, {72, 55}, {72, 57},
        {72, 60}, {72, 62}, {72, 65}, {72, 67}, {72, 70}, {72, 72}, {71, 17},
        {71, 18}, {71, 19}, {71, 20}, {71, 27}, {71, 30}, {71, 37}, {71, 38},
        {71, 39}, {71, 40}, {71, 47}, {71, 50}, {71, 57}, {71, 58}, {71, 59},
        {71, 60}, {71, 67}, {71, 70}, {70, 15}, {70, 17}, {70, 20}, {70, 22},
        {70, 25}, {70, 27}, {70, 30}, {70, 32}, {70, 35}, {70, 37}, {70, 40},
        {70, 42}, {70, 45}, {70, 47}, {70, 50}, {70, 52}, {70, 55}, {70, 57},
        {70, 60}, {70, 62}, {70, 65}, {70, 67}, {70, 70}, {70, 72}, {69, 15},
        {69, 16}, {69, 21}, {69, 22}, {69, 25}, {69, 26}, {69, 31}, {69, 32},
        {69, 35}, {69, 36}, {69, 41}, {69, 42}, {69, 45}, {69, 46}, {69, 51},
        {69, 52}, {69, 55}, {69, 56}, {69, 61}, {69, 62}, {69, 65}, {69, 66},
        {69, 71}, {69, 72}, {66, 15}, {66, 16}, {66, 21}, {66, 22}, {66, 25},
        {66, 26}, {66, 31}, {66, 32}, {66, 35}, {66, 36}, {66, 41}, {66, 42},
        {66, 45}, {66, 46}, {66, 51}, {66, 52}, {66, 55}, {66, 56}, {66, 61},
        {66, 62}, {66, 65}, {66, 66}, {66, 71}, {66, 72}, {65, 15}, {65, 17},
        {65, 20}, {65, 22}, {65, 25}, {65, 27}, {65, 30}, {65, 32}, {65, 35},
        {65, 37}, {65, 40}, {65, 42}, {65, 45}, {65, 47}, {65, 50}, {65, 52},
        {65, 55}, {65, 57}, {65, 60}, {65, 62}, {65, 65}, {65, 67}, {65, 70},
        {65, 72}, {64, 17}, {64, 18}, {64, 19}, {64, 20}, {64, 27}, {64, 30},
        {64, 37}, {64, 38}, {64, 39}, {64, 40}, {64, 47}, {64, 50}, {64, 57},
        {64, 58}, {64, 59}, {64, 60}, {64, 67}, {64, 70}, {63, 15}, {63, 17},
        {63, 20}, {63, 22}, {63, 25}, {63, 27}, {63, 30}, {63, 32}, {63, 35},
        {63, 37}, {63, 40}, {63, 42}, {63, 45}, {63, 47}, {63, 50}, {63, 52},
        {63, 55}, {63, 57}, {63, 60}, {63, 62}, {63, 65}, {63, 67}, {63, 70},
        {63, 72}, {62, 15}, {62, 16}, {62, 21}, {62, 22}, {62, 25}, {62, 26},
        {62, 31}, {62, 32}, {62, 35}, {62, 36}, {62, 41}, {62, 42}, {62, 45},
        {62, 46}, {62, 51}, {62, 52}, {62, 55}, {62, 56}, {62, 61}, {62, 62},
        {62, 65}, {62, 66}, {62, 71}, {62, 72}};
    offset.first = 10;
    offset.second = 10;
    this->setGrid(this->fillGrid(activeCellsV, offset));
    break;
  default:
    printf("Default Case!\n");
    break;
  }
}

// Return the current grid
std::string Grid::exportGrid() {
  std::string grid_s;

  for (int i = 0; i < GRIDSIZE; i++) {
    for (int j = 0; j < GRIDSIZE; j++) {
      if (this->grid[i][j])
        grid_s += (std::to_string(i) + "-" + std::to_string(j) + ",");
    }
  }

  if (grid_s.size())
    grid_s.pop_back();

  return grid_s;
}

// Fill and return a new grid using active cell data
GridValues Grid::fillGrid(std::vector<std::pair<int, int>> activeCells,
                          std::pair<int, int> offset) {
  GridValues grid = {};
  for (std::pair<int, int> coords : activeCells) {
    grid[coords.first - offset.first - 40][coords.second - offset.second] =
        true;
    printf("(%d, %d) ", coords.first, coords.second);
  }
  return grid;
}

int main() {
  /*Grid grid;
  grid.showGrid();
  grid.doTurn();
  grid.showGrid();*/

  return 0;
}

EMSCRIPTEN_BINDINGS(c) {
  class_<Grid>("GameGrid")
      .constructor<>()
      .function("isActive", &Grid::isActive)
      .function("toggle", &Grid::toggle)
      .function("setGrid", &Grid::setGrid)
      .function("exportGrid", &Grid::exportGrid)
      .function("clearGrid", &Grid::clearGrid)
      .function("doTurn", &Grid::doTurn)
      .function("loadTemplate", &Grid::loadTemplate)
      .function("showGrid", &Grid::showGrid);

  enum_<GridTemplate>("GridTemplate")
      .value("GLIDER_GUN", GLIDER_GUN)
      .value("BI_GUN", BI_GUN)
      .value("AK94", AK94)
      .value("SIMKIN_GLIDER_GUN", SIMKIN_GLIDER_GUN)
      .value("PIPE_DREAMS", PIPE_DREAMS);
}
