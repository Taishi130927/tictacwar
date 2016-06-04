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
      warlock = 4,
      priest = 5,
      pirate = 6,
      paladin = 7,
      ninja = 8
    };

    var urlString: string = "http://52.69.174.208:1337/img/";

    this.hname = heroname;
    this.hid = Heroes[heroname];
    this.hurl = urlString + heroname + ".png";
    this.powerOn = false;
    this.miscCount = 0;

  }
}