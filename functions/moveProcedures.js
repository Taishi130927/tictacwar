$('td').click(function() {

  if (game.player.hero.powerOn) {

    if (game.player.hero.hid === 7) {
      // paladin

      var row1 = parseInt($(this).parent().attr('class').charAt(3)),
              column1 = parseInt($(this).attr('class').charAt(6));
      var myMove = new Move(row1, column1, game.player, false, 0);

      game.applyHeroPower(myMove);

    } else if (game.player.hero.hid === 6) {
      // pirate
      if ($(this).hasClass('chosen')) {
        if (game.player.hero.miscCount === 2 ) {

          var row1 = parseInt($(this).parent().attr('class').charAt(3)),
              column1 = parseInt($(this).attr('class').charAt(6));
          var myMove = new Move(row1, column1, game.player, false, 0);

          if (game.board.subGrid[myMove.globalRow][myMove.globalColumn].grid[myMove.subRow][myMove.subColumn] === game.enemy.id ) game.applyHeroPower(myMove);

        } else if (game.player.hero.miscCount === 1 ) {

          var row1 = parseInt($(this).parent().attr('class').charAt(3)),
              column1 = parseInt($(this).attr('class').charAt(6));
          var myMove = new Move(row1, column1, game.player, false, 0);

          if (game.board.subGrid[myMove.globalRow][myMove.globalColumn].grid[myMove.subRow][myMove.subColumn] === game.player.id ) game.applyHeroPower(myMove);

        }
      }
    } else if (game.player.hero.hid !== 3 && !$(this).hasClass('chosen')) {

      var row1 = parseInt($(this).parent().attr('class').charAt(3)),
          column1 = parseInt($(this).attr('class').charAt(6));
      var type = 0;

      if (game.player.hero.hid === 2) {
        type = 1;
      } else if (game.player.hero.hid === 4) {
        type = 2;
      }

      var myMove = new Move(row1, column1, game.player, false, type);
      game.applyHeroPower(myMove);

    } else if (game.player.hero.hid === 3 && $(this).hasClass('chosen')) {
      // rogue
      var row1 = parseInt($(this).parent().attr('class').charAt(3)),
          column1 = parseInt($(this).attr('class').charAt(6));
      var myMove = new Move(row1, column1, game.player, false, 0);

      if (game.board.subGrid[myMove.globalRow][myMove.globalColumn].grid[myMove.subRow][myMove.subColumn] === game.enemy.id) game.applyHeroPower(myMove);

    } else if (game.player.hero.hid === 4 && $(this).hasClass('chosen')) {
      // warlock
      var row1 = parseInt($(this).parent().attr('class').charAt(3)),
          column1 = parseInt($(this).attr('class').charAt(6));
      var myMove = new Move(row1, column1, game.player, false, 0);

      if (game.board.subGrid[myMove.globalRow][myMove.globalColumn].grid[myMove.subRow][myMove.subColumn] === 4 + game.player.id) game.applyHeroPower(myMove);

    }
  } else if (game.player.myTurn) {

    if ($(this).hasClass('chosen')) {

      // alert('Invalid move!');

    } else {
      //My Move
      var row1 = parseInt($(this).parent().attr('class').charAt(3)),
          column1 = parseInt($(this).attr('class').charAt(6));
      var myMove = new Move(row1, column1, game.player, false, 0);
      game.processMove(myMove);

      var rmove = game.generateRandomMove();

      if (rmove !== null) {

        setTimeout(function() {

          var rmove = game.generateRandomMove();
          game.processMove(rmove);

        }, 500);

      } else {

        game.socket.json.emit('emit_from_client', {

          room: $('#roomSelector').val(),
          enemyMove: null

        });
      }
    }

  } else {

    // alert('It\'s not your turn!');

  }
});