/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/socket.io.d.ts" />
/// <reference path="lib/mathjs.d.ts" />
var Game = (function () {
    function Game(player, enemy, board) {
        this.player = player;
        this.enemy = enemy; // for energy storage only
        this.board = board;
        this.socket = io.connect();
        this.timerId;
        this.timeCount = 0;
        this.timeLimit = 60;
    }
    Game.prototype.initialize = function () {
        $('#panel').append('<tbody></tbody>');
        for (var i = 0; i < this.board.size; i++) {
            $('tbody').append('<tr class=\"row' + i + ' globalRow' + Math.floor(i / 3) + '\"></tr>');
            for (var j = 0; j < this.board.size; j++) {
                $('.row' + i).append('<td class=\"column' + j + ' globalColumn' + Math.floor(j / this.board.subSize) + '\"></td>');
                if (i % this.board.subSize === 0) {
                    switch (j % this.board.subSize) {
                        case 0:
                            $('.row' + i + ' .column' + j).attr('data-position', 'topleft');
                            break;
                        case 2:
                            $('.row' + i + ' .column' + j).attr('data-position', 'topright');
                            break;
                        default:
                            $('.row' + i + ' .column' + j).attr('data-position', 'top');
                            break;
                    }
                }
                if (i % this.board.subSize === 2) {
                    switch (j % this.board.subSize) {
                        case 0:
                            $('.row' + i + ' .column' + j).attr('data-position', 'bottomleft');
                            break;
                        case 2:
                            $('.row' + i + ' .column' + j).attr('data-position', 'bottomright');
                            break;
                        default:
                            $('.row' + i + ' .column' + j).attr('data-position', 'bottom');
                            break;
                    }
                }
                if (i % this.board.subSize === 1 && j % this.board.subSize === 0)
                    $('.row' + i + ' .column' + j).attr('data-position', 'left');
                if (i % this.board.subSize === 1 && j % this.board.subSize === 2)
                    $('.row' + i + ' .column' + j).attr('data-position', 'right');
            }
        }
    };
    Game.prototype.countOn = function () {
        var tc = this.timeCount, tl = this.timeLimit * 10;
        if (tc <= tl) {
            if (tc === Math.floor(tl * 2 / 3)) {
                $('.progress-bar').addClass('progress-bar-warning');
            }
            else if (tc === Math.floor(tl * 9 / 10)) {
                $('.progress-bar').addClass('progress-bar-danger');
            }
            var game = this;
            this.timerId = setTimeout(function () {
                $('.progress-bar').css('width', 100 - tc * 100 / tl + '%');
                game.timeCount++;
                game.countOn();
            }, 100);
        }
        else {
            alert("Time up!");
            this.switchTurn(true);
        }
    };
    Game.prototype.processMove = function (move) {
        this.board.update(move);
        this.board.display(move);
        if (move.player === this.player) {
            if (!move.random) {
                console.log(this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn]);
                switch (this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn]) {
                    case 0:
                    case 1:
                        this.updateEnergy(true);
                        break;
                    case 2:
                        this.clearEnergy(true);
                        break;
                    case 3:
                    default:
                        break;
                }
            }
            this.socket.json.emit('emit_from_client', {
                room: $('#roomSelector').val(),
                enemyMove: move
            });
            if (!this.board.gameOn(move)) {
                alert('You win!');
                location.href = "";
            }
            if (!move.random) {
                this.switchTurn(false);
            }
        }
        else {
            this.enemy = move.player;
            this.updateEnergy(false);
            if (!this.board.gameOn(move)) {
                alert('You lose!');
                location.href = "";
            }
            if (move.random) {
                this.switchTurn(false);
            }
        }
    };
    Game.prototype.applyHeroPower = function (move) {
        switch (this.player.hero.hid) {
            case 0:
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                break;
            case 1:
                if (Math.floor(Math.random() * 2) === 0) {
                    move.player = new Player(this.enemy.id, this.player.hero);
                }
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                break;
            case 2:
                this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] = 2;
                var row = move.globalRow * 3 + move.subRow;
                var column = move.globalColumn * 3 + move.subColumn;
                $('.row' + row + ' .column' + column).addClass('chosen new').text('T').css('color', move.player.sidecolor).attr('data-side', move.player.side);
                this.socket.json.emit('emit_secret_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                break;
            case 3: // rogue
            case 4: // warlock
            case 5: // priest
            case 6: // pirate
            case 7: // paladin
            case 8: // ninja
            default:
        }
        $('#heroArea').text('');
        $('#indication2').text('Your Turn!');
        $('#heroArea1 div').remove();
        this.player.hero.powerOn = false;
    };
    Game.prototype.updateEnergy = function (isPlayer) {
        var tc = this.timeCount / 10;
        if (isPlayer) {
            this.player.energy = Math.min(this.player.energy + 50 * (this.timeLimit - tc) / this.timeLimit, 100);
            $('.energy-bar1').css('top', 100 - this.player.energy + '%');
            $('.energy-bar1').css('height', this.player.energy + '%');
            if (this.player.energy === 100) {
                $('.energy-bar1').addClass('energy-bar-full');
                if (this.player.hero.hid === 0 && this.player.hero.miscCount === 0) {
                    // for warrior's ability
                    this.clearEnergy(true);
                    this.player.hero.miscCount++;
                    $('#heroArea1').append('<div>charged</div>');
                }
            }
            else {
                $('.energy-bar1').removeClass('energy-bar-full');
            }
        }
        else {
            $('.energy-bar2').css('top', 100 - this.enemy.energy + '%');
            $('.energy-bar2').css('height', this.enemy.energy + '%');
            if (this.enemy.energy === 100) {
                $('.energy-bar2').addClass('energy-bar-full');
            }
            else {
                $('.energy-bar2').removeClass('energy-bar-full');
            }
        }
    };
    Game.prototype.clearEnergy = function (isPlayer) {
        if (isPlayer) {
            this.player.energy = 0;
            $('.energy-bar1').css('top', '100%');
            $('.energy-bar1').css('height', '0%');
            $('.energy-bar1').removeClass('energy-bar-full');
        }
        else {
            this.enemy.energy = 0;
            $('.energy-bar2').css('top', '100%');
            $('.energy-bar2').css('height', '0%');
            $('.energy-bar2').removeClass('energy-bar-full');
        }
    };
    Game.prototype.switchTurn = function (forced) {
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
        }
        else {
            this.player.myTurn = true;
            $('#indication2').text('Your turn!');
            this.countOn();
        }
    };
    Game.prototype.generateRandomMove = function () {
        var srow, scolumn, grow, gcolumn;
        while (true) {
            srow = Math.floor(Math.random() * this.board.subSize);
            scolumn = Math.floor(Math.random() * this.board.subSize);
            grow = Math.floor(Math.random() * this.board.subSize);
            gcolumn = Math.floor(Math.random() * this.board.subSize);
            var check = this.board.subGrid[grow][gcolumn].grid[srow][scolumn];
            if (!(check === 1 || check === 0))
                break;
        }
        var row = grow * 3 + srow, column = gcolumn * 3 + scolumn;
        var rmove = new Move(row, column, this.player, true);
        return rmove;
    };
    return Game;
})();
var Hero = (function () {
    function Hero(heroname) {
        var Heroes;
        (function (Heroes) {
            Heroes[Heroes["warrior"] = 0] = "warrior";
            Heroes[Heroes["mage"] = 1] = "mage";
            Heroes[Heroes["hunter"] = 2] = "hunter";
            Heroes[Heroes["rogue"] = 3] = "rogue";
            Heroes[Heroes["warlock"] = 4] = "warlock";
            Heroes[Heroes["priest"] = 5] = "priest";
            Heroes[Heroes["pirate"] = 6] = "pirate";
            Heroes[Heroes["paladin"] = 7] = "paladin";
            Heroes[Heroes["ninja"] = 8] = "ninja";
        })(Heroes || (Heroes = {}));
        var HeroURLs = {
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
    return Hero;
})();
var Player = (function () {
    function Player(id, hero) {
        var properties = [
            ["◯", "red"],
            ["×", "blue"]
        ];
        var turns = [true, false];
        this.id = id;
        this.hero = hero;
        this.side = properties[id][0];
        this.sidecolor = properties[id][1];
        this.myTurn = turns[id];
        this.energy = 50;
    }
    return Player;
})();
var Board = (function () {
    function Board(size) {
        this.size = size;
        var subSize = Math.sqrt(size);
        this.subSize = subSize;
        var subGrid = new Array(subSize), globalGrid = new Array(subSize);
        for (var i = 0; i < subSize; i++) {
            subGrid[i] = new Array(subSize);
            globalGrid[i] = new Array(subSize);
            for (var j = 0; j < size; j++) {
                subGrid[i][j] = new SubBoard(subSize);
            }
        }
        this.subGrid = subGrid;
        this.globalGrid = globalGrid;
    }
    Board.prototype.update = function (move) {
        this.subGrid[move.globalRow][move.globalColumn].update(move);
        this.globalGrid[move.globalRow][move.globalColumn] = this.subGrid[move.globalRow][move.globalColumn].occupationUpdate(move);
    };
    Board.prototype.display = function (move) {
        var player = move.player;
        var row = 3 * move.globalRow + move.subRow, column = 3 * move.globalColumn + move.subColumn;
        var occupant = this.globalGrid[move.globalRow][move.globalColumn];
        if (occupant !== -1) {
            $('.globalRow' + move.globalRow + ' .globalColumn' + move.globalColumn).attr('data-occupant', occupant);
        }
        if ($('.new').length >= 2 && !move.random)
            $('td').removeClass('new');
        $('.row' + row + ' .column' + column).addClass('chosen new').text(player.side).css('color', player.sidecolor).attr('data-side', player.side);
    };
    Board.prototype.gameOn = function (move) {
        var row = move.globalRow, column = move.globalColumn, side = move.player.id;
        var horiz = true, vert = true, diag1 = (row === column), diag2 = (row === this.size - 1 - column);
        for (var i = 0; i < this.subSize; i++) {
            if (this.globalGrid[row][i] !== side) {
                horiz = false;
            }
            if (this.globalGrid[i][column] !== side) {
                vert = false;
            }
        }
        if (diag1 || diag2) {
            for (var i = 0; i < this.subSize; i++) {
                if (this.globalGrid[i][i] !== side) {
                    diag1 = false;
                }
                if (this.globalGrid[i][this.subSize - 1 - i] !== side) {
                    diag2 = false;
                }
            }
        }
        return !(horiz || vert || diag1 || diag2);
    };
    return Board;
})();
var SubBoard = (function () {
    function SubBoard(size) {
        this.size = size;
        this.occupant = -1;
        var grid = new Array(size);
        for (var i = 0; i < size; i++) {
            grid[i] = new Array(size);
        }
        this.grid = grid;
    }
    SubBoard.prototype.update = function (move) {
        this.grid[move.subRow][move.subColumn] = move.player.id;
    };
    SubBoard.prototype.occupationUpdate = function (move) {
        if (move.player.id === this.occupant) {
            return this.occupant;
        }
        else {
            var row = move.subRow, column = move.subColumn, side = move.player.id;
            var horizInvalid = false, vertInvalid = false, diagInvalid1 = !(row === column), diagInvalid2 = !(row === this.size - 1 - column);
            for (var i = 0; i < this.size; i++) {
                if (this.grid[row][i] !== side) {
                    horizInvalid = true;
                }
                if (this.grid[i][column] !== side) {
                    vertInvalid = true;
                }
            }
            if (!diagInvalid1 || !diagInvalid2) {
                for (var i = 0; i < this.size; i++) {
                    if (this.grid[i][i] !== side) {
                        diagInvalid1 = true;
                    }
                    if (this.grid[i][this.size - 1 - i] !== side) {
                        diagInvalid2 = true;
                    }
                }
            }
        }
        if (!horizInvalid || !vertInvalid || !diagInvalid1 || !diagInvalid2) {
            this.occupant = move.player.id;
            return move.player.id;
        }
        else {
            return this.occupant;
        }
    };
    return SubBoard;
})();
var Move = (function () {
    function Move(row, column, player, random) {
        this.globalRow = Math.floor(row / 3);
        this.globalColumn = Math.floor(column / 3);
        this.subRow = row % 3;
        this.subColumn = column % 3;
        this.player = player;
        this.random = random;
    }
    return Move;
})();
