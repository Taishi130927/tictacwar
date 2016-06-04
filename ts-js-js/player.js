var Player = (function () {
    function Player(id, hero) {
        var properties = [
            ["◯", "red"],
            ["×", "blue"]
        ];
        var turns = [true, false];
        var energies = [0, 50];
        this.id = id;
        this.sideNum = id;
        this.hero = hero;
        this.side = properties[id][0];
        this.sidecolor = properties[id][1];
        this.myTurn = turns[id];
        this.energy = energies[id];
        this.sealed = 0;
    }
    return Player;
}());
