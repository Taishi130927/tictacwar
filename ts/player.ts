class Player {

  id: number; //プレイヤー固有
  sideNum: number; //ボードに保持する数値
  side: string;
  sidecolor: string;
  myTurn: boolean;
  energy: number;
  hero: Hero;
  sealed: number;

  constructor(id: number, hero: Hero) {

    var properties: string[][] = [
      ["◯", "red"],
      ["×", "blue"]
    ];
    var turns: boolean[] = [true, false];
    var energies: number[] = [0, 50];

    this.id = id;
    this.sideNum = id;
    this.hero = hero;
    this.side = properties[id][0];
    this.sidecolor = properties[id][1];
    this.myTurn = turns[id];
    this.energy = energies[id];
    this.sealed = 0;

  }
}
