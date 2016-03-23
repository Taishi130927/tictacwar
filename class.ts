/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/socket.io.d.ts" />
/// <reference path="lib/mathjs.d.ts" />

class Game {

  player: Player;
  enemy: Player;
  board: Board;
  timerId: Timer;
  timeCount: number;
  timeLimit: number;
  socket: Socket;

  constructor(player: Player, enemy: Player, board: Board) {

    this.player = player;
    this.enemy = enemy; // for energy storage only
    this.board = board;
    this.socket = io.connect();
    this.timerId;
    this.timeCount = 0;
    this.timeLimit = 60;

  }

  public initialize(): void {

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

  public countOn(): void {

    var tc = this.timeCount,
        tl = this.timeLimit * 10;

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
        game.countOn();

      }, 100);

    } else {

        alert("Time up!");
        this.switchTurn(true);

    }
  }

  public processMove(move: Move): void {

    if (move.player === this.player) {

      if (this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] === this.enemy.id + 2) {

          this.clearEnergy(true);
          this.board.update(move, move.player.id)
          this.board.display(move, move.player.id);

          this.socket.json.emit('emit_from_client', {

              room: $('#roomSelector').val(),
              enemyMove: move

          });

          if (!move.random) this.switchTurn(false);

      } else {

        if (!move.random) this.updateEnergy(true);
        this.board.update(move, move.player.id)
        this.board.display(move, move.player.id);

        this.socket.json.emit('emit_from_client', {

          room: $('#roomSelector').val(),
          enemyMove: move

        });

        if (!this.board.gameOn(move)) {

          alert('You win!');
          location.href = "";

        }

        if (!move.random) this.switchTurn(false);
      }
    } else {

      this.enemy = move.player; // to update enemy's energy
      this.updateEnergy(false);

      this.board.update(move, move.player.id)
      this.board.display(move, move.player.id);

      if (!this.board.gameOn(move)) {

        alert('You lose!');
        location.href = "";

      }

       if (move.random) this.switchTurn(false);

    }
  }

  public applyHeroPower(move: Move): void {

    switch (this.player.hero.hid) {

        case 0: // warrior

          this.board.update(move, move.player.id);
          this.board.display(move, move.player.id);

          this.socket.json.emit('emit_from_client', {

              room: $('#roomSelector').val(),
              enemyMove: move

          });

          this.player.hero.miscCount--;
          $('#heroArea1 div').remove();
          $('#heroArea1').append('<div>charged: ' + this.player.hero.miscCount + '</div>');


          break;

        case 1: // mage

          if (Math.floor(Math.random() * 2) === 0) {

              move.player = new Player(this.enemy.id, this.player.hero);
              move.player.energy = 0;
              move.player.id = this.player.id;

          }

          this.board.update(move, move.player.id)
          this.board.display(move, move.player.id);

          this.socket.json.emit('emit_from_client', {

              room: $('#roomSelector').val(),
              enemyMove: move

          });

          break;

        case 2: // hunter

          if (this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] !== this.enemy.id + 2) {

            this.board.update(move, move.player.id + 2);
            this.board.display(move, move.player.id + 2);

            this.socket.json.emit('emit_secret_from_client', {

                room: $('#roomSelector').val(),
                enemyMove: move

            });
          } else {

            this.board.update(move, move.player.id)
            this.board.display(move, move.player.id);

            this.socket.json.emit('emit_from_client', {

                room: $('#roomSelector').val(),
                enemyMove: move

            });
          }

          break;

        case 3: // rogue

          this.board.update(move, move.player.id)
          this.board.display(move, move.player.id);

          this.socket.json.emit('emit_from_client', {

              room: $('#roomSelector').val(),
              enemyMove: move

          });

          var transferredMove = this.generateRandomMove();
          transferredMove.player = new Player(this.enemy.id, this.player.hero);
          transferredMove.player.energy = 0;
          transferredMove.random = false;

          this.board.update(transferredMove, transferredMove.player.id);
          this.board.display(transferredMove, transferredMove.player.id);

          this.socket.json.emit('emit_from_client', {

              room: $('#roomSelector').val(),
              enemyMove: transferredMove

          });

          break;

        case 4: // warlock

          this.board.update(move, move.player.id)
          this.board.display(move, move.player.id + 4);

          this.socket.json.emit('emit_from_client', {

            room: $('#roomSelector').val(),
            enemyMove: move

          });

          this.player.hero.miscCount--;

        case 5: // priest
        case 6: // pirate
        case 7: // paladin
        case 8: // ninja
        default:
    }

    if ((this.player.hero.hid !== 0 && this.player.hero.hid !== 4 )|| this.player.hero.miscCount === 0) {

        $('#indication2').text('Your Turn!');
        this.player.hero.powerOn = false;

    }
  }

  public updateEnergy(isPlayer: boolean): void {

    var tc = this.timeCount / 10;

    if (isPlayer) {

      this.player.energy = Math.min(this.player.energy + 50 * (this.timeLimit - tc) / this.timeLimit, 100);
      $('.energy-bar1').css('top', 100 - this.player.energy + '%');
      $('.energy-bar1').css('height', this.player.energy + '%');

      if (this.player.energy === 100) {

        $('.energy-bar1').addClass('energy-bar-full');

        if (this.player.hero.hid === 0 ) {
          // for warrior's ability
          this.clearEnergy(true);
          this.player.hero.miscCount++;
          $('#heroArea1 div').remove();
          $('#heroArea1').append('<div>charged: ' + this.player.hero.miscCount + '</div>');

        } else if (this.player.hero.hid === 4) {
          this.player.hero.miscCount += 2;
        }
      } else {
         $('.energy-bar1').removeClass('energy-bar-full');
      }

    } else {

      $('.energy-bar2').css('top', 100 - this.enemy.energy + '%');
      $('.energy-bar2').css('height', this.enemy.energy + '%');

      if (this.enemy.energy === 100) {
        $('.energy-bar2').addClass('energy-bar-full');
      } else {
         $('.energy-bar2').removeClass('energy-bar-full');
      }

    }
  }

  public clearEnergy(isPlayer: boolean): void {

    if (isPlayer) {

        this.player.energy = 0;
        $('.energy-bar1').css('top', '100%');
        $('.energy-bar1').css('height', '0%');
        $('.energy-bar1').removeClass('energy-bar-full');

    } else {

        this.enemy.energy = 0;
        $('.energy-bar2').css('top', '100%');
        $('.energy-bar2').css('height', '0%');
        $('.energy-bar2').removeClass('energy-bar-full');

    }
  }

  public switchTurn(forced: boolean): void {

    if (this.player.myTurn) {

      this.player.myTurn = false;
      $('#indication2').text('Enemy turn!');
      this.timeCount = 0;
      clearTimeout(this.timerId);
      $('.progress-bar').removeClass('progress-bar-warning progress-bar-danger');
      $('.progress-bar').css('width', '100%');

      if (forced) {

          this.socket.json.emit('emit_from_client', {

          room: $('#roomSelector').val(),
          enemyMove: null

        });
      }

    } else {

      this.player.myTurn = true;
      $('#indication2').text('Your turn!');
      this.countOn();
    }
  }

  public generateRandomMove(): Move {

    var srow, scolumn, grow, gcolumn;

    while (true) {

      srow = Math.floor(Math.random() * this.board.subSize);
      scolumn = Math.floor(Math.random() * this.board.subSize);
      grow = Math.floor(Math.random() * this.board.subSize);
      gcolumn = Math.floor(Math.random() * this.board.subSize);
      var check = this.board.subGrid[grow][gcolumn].grid[srow][scolumn];

      if (!(check === 1 || check === 0 || check === this.player.id + 2)) break;
    }

    var row = grow * 3 + srow,
        column = gcolumn * 3 + scolumn;
    var rmove = new Move(row, column, this.player, true, this.player.id);

    return rmove;
  }
}

class Hero {

  hname: string;
  hid: number;
  hurl: string;
  powerOn: boolean;
  miscCount: number; // warrior: charged oe not,

  constructor(heroname: string) {

  enum Heroes {
    warrior = 0,
    mage = 1,
    hunter = 2,
    rogue = 3,
    warlock =  4,
    priest = 5,
    pirate = 6,
    paladin = 7,
    ninja = 8
  }

  var HeroURLs: {
    warrior: string;
    mage: string;
    hunter: string;
    rogue: string;
    warlock: string;
    priest: string;
    pirate: string;
    paladin: string;
    ninja: string;
  }
  = {
    warrior: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/rona.png",
    mage: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/celeste.png",
    hunter: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/ringo.png",
    rogue: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/glaive.png",
    warlock: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/krul.png",
    priest: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/reim.png",
    pirate: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/koshka.png",
    paladin: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/blackfeather.png",
    ninja: "http://www.vaingloryfire.com/images/wikibase/icon/heroes/taka.png"
  };

    this.hname = heroname;
    this.hid = Heroes[heroname];
    this.hurl = HeroURLs[heroname];
    this.powerOn = false;
    this.miscCount = 0;

  }
}

class Player {

  id: number;
  side: string;
  sidecolor: string;
  myTurn: boolean;
  energy: number;
  hero: Hero;

  constructor(id: number, hero: Hero) {

    var properties: string[][] = [
        ["◯", "red"],
        ["×", "blue"]
      ];
    var turns: boolean[] = [true, false];
    var energies: number[] = [0, 50];

    this.id = id;
    this.hero = hero;
    this.side = properties[id][0];
    this.sidecolor = properties[id][1];
    this.myTurn = turns[id];
    this.energy = energies[id];

  }
}


class Board {

  size: number;
  subSize: number;
  subGrid: SubBoard[][];
  globalGrid: number[][];
  lastMove: Move;

  constructor(size: number) {

    this.size = size;
    var subSize: number = Math.sqrt(size);
    this.subSize = subSize;
    var subGrid: SubBoard[][] = new Array(subSize),
        globalGrid: number[][] = new Array(subSize);

    for (var i = 0; i < subSize; i++){

      subGrid[i] = new Array(subSize);
      globalGrid[i] = new Array(subSize);

      for (var j = 0; j < size; j++){
        subGrid[i][j] = new SubBoard(subSize);
      }

    }

    this.subGrid = subGrid;
    this.globalGrid = globalGrid;

  }

  public update(move: Move, type: number): void {

    this.subGrid[move.globalRow][move.globalColumn].update(move, type);
    this.globalGrid[move.globalRow][move.globalColumn] = this.subGrid[move.globalRow][move.globalColumn].occupationUpdate(move)

  }

  public display(move: Move, type: number): void {

    var player = move.player;
    var row = 3 * move.globalRow + move.subRow,
        column = 3 * move.globalColumn + move.subColumn;

    if (this.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] === undefined) {
      // when Hunter's or Rogue's ability is acviated
      alert('Ability Activated!');
      if (!move.random) $('td').removeClass('new');
      $('.row' + row + ' .column' + column).removeClass('chosen').addClass('new').text('');

    } else {

      var occupant = this.globalGrid[move.globalRow][move.globalColumn];

      if (occupant !== -1) {

        $('.globalRow' + move.globalRow + ' .globalColumn' + move.globalColumn).attr('data-occupant', occupant);
      }

      var displayText: string;

      switch (type) {

        case 0:
        case 1:
          displayText = player.side;
          break;

        case 2:
        case 3:
          displayText = '!'
          break;

        case 4:
        case 5:
          displayText = '#';
          break;

        default:
      }

      if (this.lastMove !== undefined && move.player.id !== this.lastMove.player.id) $('td').removeClass('new');
      $('.row' + row + ' .column' + column).addClass('chosen new').text(displayText).css('color', player.sidecolor).attr('data-side', player.side);

    }

    this.lastMove = move;
  }

  public gameOn(move: Move): boolean {

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

class SubBoard {

   size: number;
   occupant: number;
   grid: number[][];

  constructor(size: number) {

    this.size = size;
    this.occupant = -1;
    var grid: number[][] = new Array(size);

    for (var i = 0; i < size; i++){
      grid[i] = new Array(size);
    }

    this.grid = grid;

  }

  public update(move: Move, type: number): void {

    if (this.grid[move.subRow][move.subColumn] !== undefined) {
      this.grid[move.subRow][move.subColumn] = undefined;
    } else {
      this.grid[move.subRow][move.subColumn] = type;
    }
  }

  public occupationUpdate(move: Move): number {

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

 class Move {

   globalRow: number;
   globalColumn: number;
   subRow: number;
   subColumn: number;
   player: Player;
   random: boolean;
   type: number;

   constructor(row: number, column: number, player: Player, random: boolean, type: number) {

    this.globalRow = Math.floor(row / 3);
    this.globalColumn = Math.floor(column / 3);
    this.subRow = row % 3;
    this.subColumn = column % 3;
    this.player = player;
    this.random = random;
    this.type = type;

  }

}