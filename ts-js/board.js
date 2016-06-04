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
        if (this.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] === undefined) {
            // when Hunter's or Rogue's ability is acviated
            alert('Ability Activated!');
            if (this.lastMove !== undefined && move.player.id !== this.lastMove.player.id)
                $('td').removeClass('new');
            $('.row' + row + ' .column' + column).removeClass('chosen').addClass('new').text('');
            if (occupant === -1)
                $('.globalRow' + move.globalRow + ' .globalColumn' + move.globalColumn).removeAttr('data-occupant');
        }
        else {
            if (occupant !== -1) {
                $('.globalRow' + move.globalRow + ' .globalColumn' + move.globalColumn).attr('data-occupant', occupant);
            }
            else {
                $('.globalRow' + move.globalRow + ' .globalColumn' + move.globalColumn).removeAttr('data-occupant');
            }
            var displayText;
            switch (move.type) {
                case 0:
                    displayText = player.side;
                    break;
                case 1:
                    displayText = '!';
                    break;
                case 2:
                    displayText = '#';
                    break;
                default:
            }
            if (this.lastMove !== undefined && move.player.id !== this.lastMove.player.id)
                $('td').removeClass('new');
            $('.row' + row + ' .column' + column).addClass('chosen new').text(displayText).css('color', player.sidecolor).attr('data-side', player.side);
        }
        this.lastMove = move;
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
}());
