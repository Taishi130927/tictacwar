var board = new Board(9);
var initialized = false;

var playerHero, enemyHero;
var id = -1;
var player = new Player(0, 'warrior'),
    enemy = new Player(1, 'warrior');
player.myTurn = false;
var game = new Game(player, enemy, board);
// Game Initialization
game.initialize();


$('#enter').click(function() {

    if (id === -1) {

    game.socket.json.emit('emit_room', {

      room: $('#roomSelector').val(),
      hero: $('#heroSelector').val()

    });

    playerHero = new Hero($('#heroSelector').val());
    $('#icon1').attr('src', playerHero.hurl);
    if (playerHero.hid === 0) $('#heroArea1').append('<div>charged: ' + playerHero.miscCount + '</div>');


  }
});


