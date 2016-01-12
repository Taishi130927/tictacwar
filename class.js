Game = function(player, board) {

  this.player = player;
  this.board = board;
  this.timerId;
  this.timeCount = 0;

  this.initialize = function() {

    for (var i = 0; i < this.board.size; i++) {
      $('#panel').append('<tr id=row' + i +'></tr>');
      for (var j = 0; j < this.board.size; j++) {
          $('#row' + i).append('<td id=column' + j +'>  </td>');
      }
    }
  }

  this.countOn = function() {

    var tc = this.timeCount;

    if (tc <= 300) {

      if (tc === 200) {
          $('.progress-bar').addClass('progress-bar-warning');
      } else if (tc === 270) {
          $('.progress-bar').addClass('progress-bar-danger');
      }
      var game = this;
      this.timerId = setTimeout(function() {

        $('.progress-bar').css('width', 100 - tc * 100 / 300 + '%');
        game.timeCount++;
        game.countOn();

      }, 100);

    } else {
        clearTimeout(this.timerId);
    }
  }
}

Hero = function(heroname) {

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

  this.hname = heroname;
  this.hid = heroes[heroname];

}

Player = function(id) {

  var properties = [
      ["◯", "red", true],
      ["×", "blue", false]
    ];

  this.id = id;
  this.side = properties[id][0];
  this.sidecolor = properties[id][1];
  this.myTurn = properties[id][2];

}


Board = function(size) {

  this.size = size;
  var subSize = Math.sqrt(size);
  this.subSize = subSize;
  var subGrid = new Array(subSize),
      globalGrid = new Array(subSize);

  for (var i = 0; i < subSize; i++){

    subGrid[i] = new Array(subSize);
    globalGrid[i] = new Array(subSize);

    for (var j = 0; j < size; j++){
      subGrid[i][j] = new SubBoard(subSize);
    }

  }

  this.subGrid = subGrid;
  this.globalGrid = globalGrid;

  this.update = function (move) {

    this.subGrid[move.globalRow][move.globalColumn].update(move);
    this.globalGrid[move.globalRow][move.globalColumn] = this.subGrid[move.globalRow][move.globalColumn].occupationUpdate(move);

  }

  this.display = function(move) {

    var player = move.player;
    var row = 3 * move.globalRow + move.subRow,
        column = 3 * move.globalColumn + move.subColumn;
    $('#row' + row + ' #column' + column).addClass('chosen').text(player.side).css('color', player.sidecolor).attr('data-side', player.side);

  }

  this.gameOn = function(move) {

    var row = move.globalRow,
        column = move.globalColumn,
        side = move.player.id;

    var horiz = true,
        vert = true,
        diag1 = (row === column),
        diag2 = (row === this.size - 1 - column);

    for (var i = 0; i < this.subSize; i++){

      if (this.globalGrid[row][i] !== side){
        horiz = false;
      }

      if (this.globalGrid[i][column] !== side){
        vert = false;
      }
    }

    if (diag1 || diag2){

      for (var i = 0; i < this.subSize; i++){

        if (this.globalGrid[i][i] !== side){
          diag1 = false;
        }

        if (this.globalGrid[i][this.subSize - 1 -i] !== side){
          diag2 = false;
        }
      }
    }

    return !(horiz || vert || diag1 || diag2);

  }
}

SubBoard = function(size) {

  this.size = size;
  this.occupant = null;
  var grid = new Array(size);

  for (var i = 0; i < size; i++){
    grid[i] = new Array(size);
  }

  this.grid = grid;

  this.update = function (move) {
    this.grid[move.subRow][move.subColumn] = move.player.id;
  }

  this.occupationUpdate = function(move) {

    if (move.player.id === this.occupant) {
      return this.occupant;
    } else {

      var row = move.subRow,
          column = move.subColumn,
          side = move.player.id;

      var horiz = true,
          vert = true,
          diag1 = (row === column),
          diag2 = (row === this.size - 1 - column);

      for (var i = 0; i < this.size; i++){

        if (this.grid[row][i] !== side){
          horiz = false;
        }

        if (this.grid[i][column] !== side){
          vert = false;
        }
      }

      if (diag1 || diag2){

        for (var i = 0; i < this.size; i++){

          if (this.grid[i][i] !== side){
            diag1 = false;
          }

          if (this.grid[i][this.size - 1 -i] !== side){
            diag2 = false;
          }
        }
      }
    }

    if (horiz || vert || diag1 || diag2) {
      this.occupant = move.player.id
      return move.player.id;
    } else {
      return null;
    }

  }
}

 Move = function(row, column, player, random) {

    this.globalRow = Math.floor(row / 3);
    this.globalColumn = Math.floor(column / 3);
    this.subRow = row % 3;
    this.subColumn = column % 3;
    this.player = player;
    this.random = random;

}


