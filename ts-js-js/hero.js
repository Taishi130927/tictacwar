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
        ;
        var urlString = "http://52.69.174.208:1337/img/";
        this.hname = heroname;
        this.hid = Heroes[heroname];
        this.hurl = urlString + heroname + ".png";
        this.powerOn = false;
        this.miscCount = 0;
    }
    return Hero;
}());
