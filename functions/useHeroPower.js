$('#icon1').click(function() {

  if (game.player.myTurn && game.player.sealed === 0) {

    if (game.player.hero.hid === 5 && game.player.energy === 100) {
      // priest
      game.socket.json.emit('emit_ability_from_client',{

        room: $('#roomSelector').val(),
        hero: game.player.hero.hid

      });

      game.clearEnergy(true);
      alert('Ability Activated!');

    } else if ((game.player.hero.hid !== 0 && game.player.energy === 100 )|| (game.player.hero.hid === 0 && game.player.hero.miscCount !== 0)) {

      game.socket.json.emit('emit_ability_from_client', {

        room: $('#roomSelector').val(),
        hero: game.player.hero.hid

      });

      if (game.player.hero.hid === 6) game.player.hero.miscCount = 2;

      game.player.hero.powerOn = true;
      game.clearEnergy(true);
      $('#indication2').text('Use Your Ability!');
    }
  }
});