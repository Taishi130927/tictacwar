function requestProcessor(res, url, type) {

  fs.readFile(__dirname + '/' + url, 'utf-8', function(err, data) {

    if (err) {

        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write("not found!");
        return res.end();

    }

    res.writeHead(200, {'Content-Type': type});
    res.write(data);
    res.end();

  });
}

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app)
    fs = require('fs');

app.listen(1337);
//io.set('log level', 1);
function handler(req, res) {

  switch (true) {

    case /\u002f$/.test(req.url) :
      requestProcessor(res, 'tictactoe.html', 'text/html');
      break;

    case /\/class.js/.test(req.url):
      requestProcessor(res, 'class.js', 'text/javascript');
      break;

    case /\/function.js/.test(req.url):
      requestProcessor(res, 'function.js', 'text/javascript');
      break;

    case /\/style.css/.test(req.url):
      requestProcessor(res, 'css/style.css', 'text/css');
      break;

    case /\/img\/[a-z]*/.test(req.url):
      requestProcessor(res, 'img/' + req.url.match(/[a-z.]*$/)[0], 'image/png');
      //console.log('img/' + req.url.match(/[a-z.]*$/)[0]);
      break;

    default :
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write("wrong page");
      res.end();
      break;

  }
}

console.log("server listening ...");

var roomcount = [0, 0]; //room 1,2
var heroes = ["", ""];
io.sockets.on('connection', function(socket){

  socket.on('emit_room', function(data){
    socket.join(data.room);
    var rnum = data.room.slice(5, data.room.length) - 1;
    roomcount[rnum] = (roomcount[rnum] + 1) % 2;
    var id = roomcount[rnum];
    socket.emit('emit_id', id);

     if (heroes[0] === "" && heroes[1] === "") {
      heroes[id] = data.hero;
      console.log(heroes);
    } else {

      heroes[id] = data.hero;
      console.log(heroes);
      socket.json.emit('emit_hero', {

        heroes: heroes,
        id: id

      });

       socket.json.to(data.room).emit('emit_hero', {

        heroes: heroes,
        id: id

      });

       heroes = ["", ""];

    }
  });


  socket.on('emit_from_client', function(data) {
    socket.broadcast.to(data.room).emit('emit_from_enemy', data)
  });

  socket.on('emit_ability_from_client', function(data) {
    socket.broadcast.to(data.room).emit('emit_ability_from_enemy', data);
  });

  socket.on('emit_secret_from_client', function(data) {
    socket.broadcast.to(data.room).emit('emit_secret_from_enemy', data);
  });

  socket.on('emit_seal_from_client', function(data) {
    socket.broadcast.to(data).emit('emit_seal_from_enemy', data);
  });
});