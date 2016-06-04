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
        if (this.grid[move.subRow][move.subColumn] !== undefined) {
            this.grid[move.subRow][move.subColumn] = undefined;
        }
        else {
            this.grid[move.subRow][move.subColumn] = move.type * 2 + move.player.sideNum;
        }
    };
    SubBoard.prototype.occupationUpdate = function (move) {
        // console.log(move.player.sideNum);
        if (move.player.sideNum === this.occupant) {
            return this.occupant;
        }
        else {
            if (move.destructive) {
                var side = (move.player.sideNum + 1) % 2;
                // var side = move.player.sideNum;
                var horizInvalid = false, vertInvalid = false, diagInvalid1 = false, diagInvalid2 = false;
                for (var i = 0; i < this.size; i++) {
                    horizInvalid = false;
                    vertInvalid = false;
                    for (var j = 0; j < this.size; j++) {
                        if (this.grid[i][j] !== side) {
                            horizInvalid = true;
                        }
                        if (this.grid[j][i] !== side) {
                            vertInvalid = true;
                        }
                    }
                    if (!horizInvalid || !vertInvalid) {
                        return this.occupant;
                    }
                    if (this.grid[i][i] !== side) {
                        diagInvalid1 = true;
                    }
                    if (this.grid[i][this.size - 1 - i] !== side) {
                        diagInvalid2 = true;
                    }
                }
                if (!diagInvalid1 || !diagInvalid2) {
                    return this.occupant;
                }
                else {
                    this.occupant = -1;
                    return this.occupant;
                }
            }
            else {
                var row = move.subRow, column = move.subColumn, side = move.player.sideNum;
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
                if (!horizInvalid || !vertInvalid || !diagInvalid1 || !diagInvalid2) {
                    this.occupant = move.player.sideNum;
                    return move.player.sideNum;
                }
                else {
                    return this.occupant;
                }
            }
        }
    };
    return SubBoard;
}());
