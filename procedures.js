
function opponentMove(grid){
  var size = grid.length;
  var row2, column2;
      while (true) {
        row2 = Math.floor(Math.random() * size);
        column2 = Math.floor(Math.random() * size);
        if (grid[row2][column2] !== 0 && grid[row2][column2] !== 1 ){
          break;
        }
      }
  return [row2, column2];
}

function gameOn(grid, row, column, side){
  var horiz = true;
  var vert = true;
  var diag1 = (row === column);
  var diag2 = (row === grid.length - 1 - column);
  for (var i = 0; i < grid.length; i++){
    if (grid[row][i] !== side){
      horiz = false;
    }
    if (grid[i][column] !== side){
      vert = false;
    }
  }

  if (diag1 || diag2){
    for (var i = 0; i < grid.length; i++){
      if (grid[i][i] !== side){
        diag1 = false;
      }
      if (grid[i][grid.length - 1 -i] !== side){
        diag2 = false;
      }
    }
  }

  return !(horiz || vert || diag1 || diag2);
}
