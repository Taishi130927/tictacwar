var Move = (function () {
    function Move(row, column, player, random, type, destructive) {
        if (destructive === void 0) { destructive = false; }
        this.globalRow = Math.floor(row / 3);
        this.globalColumn = Math.floor(column / 3);
        this.subRow = row % 3;
        this.subColumn = column % 3;
        this.player = player;
        this.random = random;
        this.type = type;
        this.destructive = destructive;
    }
    return Move;
}());
