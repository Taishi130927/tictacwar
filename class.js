Player = function(side, sidecolor, myturn) {

  this.side = side;
  this.sidecolor = sidecolor;
  this.myturn = myturn;

}


Board = function(size) {

  this.size = size;
  var grid = new Array(size);

  for (var i = 0; i < size; i++){
    grid[i] = new Array(size);
  }

  this.grid = grid;

}

 Move = function(row, column, binaryside) {

    this.row = row;
    this.column = column;
    this.binaryside = binaryside;

}

Board.prototype.update = function (move) {
  this.grid[move.row][move.column] = move.binaryside;
}

Board.prototype.display = function(player, move) {

  $('#row' + move.row + ' #column' + move.column).addClass('chosen').text(player.side).css('color', player.sidecolor).attr('data-side', player.side);

}

Board.prototype.allyCounter = function(move, count, inc, type) {

  var row = move.row,
      column = move.column,
      side = move.binaryside;

  if (type === "vertical"){

    if (row + inc >= 0 && row + inc < this.size) {

      if (this.grid[row + inc][column] === side) {

        count += 1;
        var move = new Move(row + inc, column, side);
        return this.allyCounter(move, count, inc, type);

      } else {
        return count;
      }

    } else {
      return count;
    }

  } else if (type === "horizontal") {

    if (column + inc >= 0 && column + inc < this.size) {

      if (this.grid[row][column + inc] === side) {

        count += 1;
        var move = new Move(row, column + inc, side);
        return this.allyCounter(move, count, inc, type);

      } else {
        return count;
      }

    } else {
      return count;
    }

  } else if (type === "rdiagonal") {

    if (row + inc >= 0 && row + inc < this.size && column + inc >= 0 && column + inc < this.size) {

      if (this.grid[row + inc][column + inc] === side) {

        count += 1;
        var move = new Move(row + inc, column + inc, side);
        return this.allyCounter(move, count, inc, type);

      } else {
        return count;
      }

    } else {
      return count;
    }

  } else {

    if (row - inc >= 0 && row - inc < this.size && column + inc >= 0 && column + inc < this.size) {

      if (this.grid[row - inc][column + inc] === side) {

        count += 1;
        var move = new Move(row - inc, column + inc, side);
        return this.allyCounter(move, count, inc, type);


      } else {
        return count;
      }

    } else {
      return count;
    }
  }
}


Board.prototype.gameOn = function(move) {

  var goalnum = 4;

  if (this.allyCounter(move, 1, 1, "horizontal") + this.allyCounter(move, 1, -1, "horizontal")  >= goalnum + 1) {
    return false;
  }

  if (this.allyCounter(move, 1, 1, "vertical") + this.allyCounter(move, 1, -1, "vertical") >= goalnum + 1) {
    return false;
  }

  if (this.allyCounter(move, 1, 1, "rdiagonal") + this.allyCounter(move, 1, -1, "rdiagonal") >= goalnum + 1) {
    return false;
  }

 if (this.allyCounter(move, 1, 1, "ldiagonal") + this.allyCounter(move, 1, -1, "ldiagonal") >= goalnum + 1) {
    return false;
  }

  return true;
}
