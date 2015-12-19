
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

function allyCounter(grid, row, column, count, side, inc, type){

  if (type === "horizontal"){

    if (row + inc >= 0 && row + inc < grid.length){

      if (grid[row + inc][column] === side){

        count += 1;
        return allyCounter(grid, row + inc, column, count, side, inc, type);

      } else {
        return count;
      }

    } else {
      return count;
    }

  } else if (type === "vertical"){

    if (column + inc >= 0 && column + inc < grid.length){

      if (grid[row][column + inc] === side){

        count += 1;
        return allyCounter(grid, row, column + inc, count, side, inc, type);

      } else {
        return count;
      }

    } else {
      return count;
    }

  } else {

    if (row + inc >= 0 && row + inc < grid.length && column + inc >= 0 && column + inc < grid.length){

      if (grid[row + inc][column + inc] === side){

        count += 1;
        return allyCounter(grid, row + inc, column + inc, count, side, inc, type);

      } else {
        return count;
      }

    } else {
      return count;
    }
  }
}


function gameOn(grid, row, column, side){

  var goalnum = 4;
  // var horiz = true,
  //     vert = true,
  //     diag1 = (row === column),
  //     diag2 = (row === grid.length - 1 - column);

  // for (var i = 0; i < grid.length; i++){
  //   if (grid[row][i] !== side){
  //     horiz = false;
  //   }
  //   if (grid[i][column] !== side){
  //     vert = false;
  //   }
  // }

  // if (diag1 || diag2){
  //   for (var i = 0; i < grid.length; i++){
  //     if (grid[i][i] !== side){
  //       diag1 = false;
  //     }
  //     if (grid[i][grid.length - 1 -i] !== side){
  //       diag2 = false;
  //     }
  //   }
  // }

  // return !(horiz || vert || diag1 || diag2);

  if (allyCounter(grid, row, column, 1, side, 1, "horizontal") + allyCounter(grid, row, column, 1, side, -1, "horizontal") >= goalnum){
    return false;
  }

  if (allyCounter(grid, row, column, 1, side, 1, "vertical") + allyCounter(grid, row, column, 1, side, -1, "vertical") >= goalnum){
    return false;
  }

  if (allyCounter(grid, row, column, 1, side, 1, "diagonal") + allyCounter(grid, row, column, 1, side, -1, "diagonal") >= goalnum){
    return false;
  }

  return true;
}
