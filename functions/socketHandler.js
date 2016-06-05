game.socket.on('emit_id', function(data) {
  id = data;
});

game.socket.on('emit_hero', function(data) {

  if (!initialized) {

    if (id === -1) id = data.id;

    enemyHero = new Hero(data.heroes[(id + 1) % 2]);
    $('#icon2').attr('src', enemyHero.hurl);

    player = new Player(id, playerHero);
    enemy = new Player((id + 1) % 2, enemyHero);

    game.player = player;
    game.enemy = enemy;
    $('.energy-bar1').css('top', 100 - game.player.energy + '%');
    $('.energy-bar1').css('height', game.player.energy + '%');
    $('.energy-bar2').css('top', 100 - game.enemy.energy + '%');
    $('.energy-bar2').css('height', game.enemy.energy + '%');
    initialized = true;
    $('#indication1').text('Your side is: ' + player.side);

    if (player.myTurn) {

      $('#indication2').text('Your turn!');
      game.countOn();

    } else {
      $('#indication2').text('Enemy turn!');
    }
  }
});

game.socket.on('emit_from_enemy', function(data) {
  if (data.enemyMove !== null) {
    game.processMove(data.enemyMove);
  } else {
    game.switchTurn(false);
  }
});

game.socket.on('emit_ability_from_enemy', function(data) {

  if (data.hero === 5) {

    game.player.sealed = 2;
    alert('Ability Activated!');

  } else if (data.hero === 8) {

    $('td').removeClass('new').text('');
    alert('Ability Activated!');

  }
  // console.log(data.hero);
  game.clearEnergy(false);

});

game.socket.on('emit_secret_from_enemy', function(data) {
  // from Hunter or Ninja
  var move = data.enemyMove;
  if (move.player.hero.hid === 2) {
    game.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] = 2 + game.enemy.id;
  } else if (move.player.hero.hid === 2) {
    game.board.subGrid[move.globalRow][move.globalColumn].grid[move.subRow][move.subColumn] = game.enemy.id;
  }
});

game.socket.on('emit_seal_from_enemy', function(data) {
  // from Priest
 game.player.sealed = 2;
 alert('Ability Activated!');
});
