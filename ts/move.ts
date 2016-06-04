class Move {

  globalRow: number;
  globalColumn: number;
  subRow: number;
  subColumn: number;
  player: Player;
  random: boolean;
  type: number;
  destructive: boolean;

  constructor(row: number, column: number, player: Player, random: boolean, type: number, destructive = false) {

    this.globalRow = Math.floor(row / 3);
    this.globalColumn = Math.floor(column / 3);
    this.subRow = row % 3;
    this.subColumn = column % 3;
    this.player = player;
    this.random = random;
    this.type = type;
    this.destructive = destructive;

  }

}