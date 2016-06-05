/// <reference path="../lib/jquery.d.ts" />
/// <reference path="../lib/socket.io.d.ts" />
/// <reference path="../lib/mathjs.d.ts" />
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
        if (move.player === this.player) {
            if (this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] === this.enemy.id + 2) {
                // Stepped on a trap
                this.clearEnergy(true);
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                if (!move.random)
                    this.switchTurn(false);
            }
            else {
                if (!move.random)
                    this.updateEnergy(true);
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                if (!this.board.gameOn(move)) {
                    alert('You win!');
                    location.href = "";
                }
                if (!move.random)
                    this.switchTurn(false);
            }
        }
        else {
            this.enemy = move.player; // to update enemy's energy
            this.updateEnergy(false);
            this.board.update(move);
            this.board.display(move);
            if (!this.board.gameOn(move)) {
                alert('You lose!');
                location.href = "";
            }
            if (move.random)
                this.switchTurn(false);
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
                this.player.hero.miscCount--;
                $('#heroArea1 div').remove();
                $('#heroArea1').append('<div>charged: ' + this.player.hero.miscCount + '</div>');
                break;
            case 1:
                if (Math.floor(Math.random() * 2) === 0) {
                    move.player = new Player(this.enemy.id, this.player.hero);
                    move.player.energy = 0;
                    move.player.id = this.player.id;
                }
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                break;
            case 2:
                if (this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] !== this.enemy.id + 2) {
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_secret_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                }
                else {
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                }
                break;
            case 3:
                move.destructive = true;
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                var transferredMove = this.generateRandomMove();
                transferredMove.player = new Player(this.enemy.id, this.player.hero);
                transferredMove.player.energy = 0;
                transferredMove.random = false;
                this.board.update(transferredMove);
                this.board.display(transferredMove);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: transferredMove
                });
                break;
            case 4:
                this.board.update(move);
                this.board.display(move);
                this.socket.json.emit('emit_from_client', {
                    room: $('#roomSelector').val(),
                    enemyMove: move
                });
                this.player.hero.miscCount--;
                break;
            case 5:
                break;
            case 6:
                if (this.player.hero.miscCount == 2) {
                    move.destructive = true;
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                }
                else {
                    var lm = this.board.lastMove;
                    lm.destructive = false;
                    this.board.update(lm);
                    this.board.display(lm);
                    this.socket.json.emit('emit_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: lm
                    });
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                    move.player = new Player(this.enemy.id, this.player.hero);
                    move.player.energy = 0;
                    move.player.id = this.player.id;
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                }
                this.player.hero.miscCount--;
                break;
            case 7:
                this.player.hero.miscCount = move.globalRow * this.board.subSize + move.globalColumn + 1;
                break;
            case 8:
                if (this.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] !== this.enemy.id + 2) {
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_secret_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                }
                else {
                    this.board.update(move);
                    this.board.display(move);
                    this.socket.json.emit('emit_from_client', {
                        room: $('#roomSelector').val(),
                        enemyMove: move
                    });
                }
                break;
            default:
        }
        if ((this.player.hero.hid === 6 || this.player.hero.hid === 8) && this.player.hero.miscCount === 0) {
            this.player.hero.powerOn = false;
            this.socket.json.emit('emit_from_client', {
                room: $('#roomSelector').val(),
                enemyMove: null
            });
            this.switchTurn(false);
        }
        else if ((this.player.hero.hid !== 0 && this.player.hero.hid !== 4 && this.player.hero.hid !== 6) || this.player.hero.miscCount === 0) {
            $('#indication2').text('Your Turn!');
            this.player.hero.powerOn = false;
        }
    };
    Game.prototype.updateEnergy = function (isPlayer) {
        var tc = this.timeCount / 10;
        if (isPlayer) {
            this.player.energy = Math.min(this.player.energy + 50 * (this.timeLimit - tc) / this.timeLimit, 100);
            $('.energy-bar1').css('top', 100 - this.player.energy + '%');
            $('.energy-bar1').css('height', this.player.energy + '%');
            if (this.player.energy === 100) {
                $('.energy-bar1').addClass('energy-bar-full');
                if (this.player.hero.hid === 0) {
                    // for warrior's ability
                    this.clearEnergy(true);
                    this.player.hero.miscCount++;
                    $('#heroArea1 div').remove();
                    $('#heroArea1').append('<div>charged: ' + this.player.hero.miscCount + '</div>');
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
            this.player.sealed = Math.max(this.player.sealed - 1, 0);
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
            this.enemy.sealed = Math.max(this.enemy.sealed - 1, 0);
        }
    };
    Game.prototype.generateRandomMove = function () {
        var srow, scolumn, grow, gcolumn;
        while (true) {
            // need ways to stop infinite loops
            if (this.player.hero.hid === 7 && this.player.hero.miscCount > 0) {
                grow = Math.floor((this.player.hero.miscCount - 1) / 3);
                gcolumn = (this.player.hero.miscCount - 1) % 3;
                if (!this.board.subGrid[grow][gcolumn].grid.some(function (v) { return v.includes(undefined); }))
                    return null;
                srow = Math.floor(Math.random() * this.board.subSize);
                scolumn = Math.floor(Math.random() * this.board.subSize);
                var check = this.board.subGrid[grow][gcolumn].grid[srow][scolumn];
            }
            else {
                srow = Math.floor(Math.random() * this.board.subSize);
                scolumn = Math.floor(Math.random() * this.board.subSize);
                grow = Math.floor(Math.random() * this.board.subSize);
                gcolumn = Math.floor(Math.random() * this.board.subSize);
                var check = this.board.subGrid[grow][gcolumn].grid[srow][scolumn];
            }
            if (check === undefined || check === 2 + this.enemy.id)
                break;
        }
        var row = grow * 3 + srow, column = gcolumn * 3 + scolumn;
        var rmove = new Move(row, column, this.player, true, 0);
        return rmove;
    };
    return Game;
}());
