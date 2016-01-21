Game = function(player, board) {

  this.player = player;
  this.board = board;
  this.socket = io.connect();
  this.timerId;
  this.timeCount = 0;

  this.initialize = function() {

   $('#panel').append('<tbody></tbody>');

    for (var i = 0; i < this.board.size; i++) {

      $('tbody').append('<tr class=\"row' + i +' globalRow' + Math.floor(i / 3) + '\"></tr>');

      for (var j = 0; j < this.board.size; j++) {

        $('.row' + i).append('<td class=\"column' + j + ' globalColumn' + Math.floor(j / this.board.subSize) + '\"></td>');
        if (i % this.board.subSize === 0) {

          switch (j % this.board.subSize) {

            case 0:
              $('.row' + i  + ' .column' + j).attr('data-position','topleft');
              break;

            case 2:
              $('.row' + i  + ' .column' + j).attr('data-position','topright');
              break

            default:
              $('.row' + i  + ' .column' + j).attr('data-position','top');
              break;

          }
        }

        if (i % this.board.subSize === 2) {

          switch (j % this.board.subSize) {

            case 0:
              $('.row' + i  + ' .column' + j).attr('data-position','bottomleft');
              break;

            case 2:
              $('.row' + i  + ' .column' + j).attr('data-position','bottomright');
              break

            default:
              $('.row' + i  + ' .column' + j).attr('data-position','bottom');
              break;

          }
        }

        if (i % this.board.subSize === 1 && j % this.board.subSize === 0) $('.row' + i  + ' .column' + j).attr('data-position','left');
        if (i % this.board.subSize === 1 && j % this.board.subSize === 2) $('.row' + i  + ' .column' + j).attr('data-position','right');

      }
    }
  }

  this.countOn = function(timeLimit) {

    var tc = this.timeCount,
        tl = timeLimit * 10;

    if (tc <= tl) {

      if (tc === Math.floor(tl * 2 / 3)) {
          $('.progress-bar').addClass('progress-bar-warning');
      } else if (tc === Math.floor(tl * 9 / 10)) {
          $('.progress-bar').addClass('progress-bar-danger');
      }

      var game = this;
      this.timerId = setTimeout(function() {

        $('.progress-bar').css('width', 100 - tc * 100 / tl + '%');
        game.timeCount++;
        game.countOn(timeLimit);

      }, 100);

    } else {

        alert("Time up!");
        this.switchTurn();

    }
  }

  this.processMove = function(move) {

    this.board.update(move);
    this.board.display(move);

    if (move.player === this.player) {

      this.socket.json.emit('emit_from_client', {

        room: $('#roomSelector').val(),
        enemyMove: move

      });

      if (!this.board.gameOn(move)) {

        alert('You win!');
        location.href = "";
      }

      this.switchTurn();

    } else {

      if (!this.board.gameOn(move)) {

        alert('You lose!');
        location.href = "";

      }

       if (move.random) {

        this.switchTurn();

       }
    }
  }

  this.switchTurn = function() {

    if (this.player.myTurn) {

      this.player.myTurn = false;
      $('#indication2').text('Enemy turn!');
      this.timeCount = 0;
      clearTimeout(this.timerId);
      $('.progress-bar').removeClass('progress-bar-warning progress-bar-danger');
      $('.progress-bar').css('width', '100%');

      this.socket.json.emit('emit_from_client', {

        room: $('#roomSelector').val(),
        enemyMove: null

      });

    } else {

      this.player.myTurn = true;
      $('#indication2').text('Your turn!');
      this.countOn(60);
    }
  }

  this.generateRandomMove = function() {

    var srow, scolumn, grow, gcolumn;

    while (true) {

      srow = Math.floor(Math.random(1) * this.board.subSize);
      scolumn = Math.floor(Math.random(1) * this.board.subSize);
      grow = Math.floor(Math.random(1) * this.board.subSize);
      gcolumn = Math.floor(Math.random(1) * this.board.subSize);
      var check = this.board.subGrid[grow][gcolumn].grid[srow][scolumn];

      if (!(check === 1 || check === 0)) break;
    }

    var row = grow * 3 + srow,
        column = gcolumn * 3 + scolumn;
    var rmove = new Move(row, column, this.player, true);

    return rmove;
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

    // console.log(this.globalGrid);

  }

  this.display = function(move) {

    var player = move.player;
    var row = 3 * move.globalRow + move.subRow,
        column = 3 * move.globalColumn + move.subColumn;

    var occupant = this.globalGrid[move.globalRow][move.globalColumn];

    if (occupant !== null) {

      $('.globalRow' + move.globalRow + ' .globalColumn' + move.globalColumn).attr('data-occupant', occupant);
    }

    if (!move.random) $('td').removeClass('new');
    $('.row' + row + ' .column' + column).addClass('chosen new').text(player.side).css('color', player.sidecolor).attr('data-side', player.side);

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

      var horizInvalid = false,
          vertInvalid = false,
          diagInvalid1 = !(row === column),
          diagInvalid2 = !(row === this.size - 1 - column);

      for (var i = 0; i < this.size; i++){

        if (this.grid[row][i] !== side){
          horizInvalid = true;
        }

        if (this.grid[i][column] !== side){
          vertInvalid = true;
        }
      }

      if (!diagInvalid1 || !diagInvalid2){

        for (var i = 0; i < this.size; i++){

          if (this.grid[i][i] !== side){
            diagInvalid1 = true;
          }

          if (this.grid[i][this.size - 1 -i] !== side){
            diagInvalid2 = true;
          }
        }
      }
    }

    if (!horizInvalid || !vertInvalid || !diagInvalid1 || !diagInvalid2) {
      this.occupant = move.player.id
      return move.player.id;
    } else {
      return this.occupant;
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