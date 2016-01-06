Hero = function(heroname){

  var heroes = {
    warrior: 0,
    mage: 1,
    hunter: 2,
    rogue: 3,
    warlock: 4,
    priest: 5,
    pirate: 6,
    paladin: 7,
    ninja: 8
  };

  this.name = heroname;
  this.num = heroes[heroname];

}

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

  this.update = function (move) {
    this.grid[move.row][move.column] = move.binaryside;
  }

  this.display = function(player, move) {

  $('#row' + move.row + ' #column' + move.column).addClass('chosen').text(player.side).css('color', player.sidecolor).attr('data-side', player.side);

  }

  this.allyCounter = function(move, count, inc, type) {

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


  this.gameOn = function(move) {

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


}

 Move = function(row, column, binaryside) {

    this.row = row;
    this.column = column;
    this.binaryside = binaryside;

}


