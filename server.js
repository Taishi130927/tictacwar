function requestProcessor(res, url, type) {

  fs.readFile(__dirname + '/' + url, 'utf-8', function(err, data) {

    if (err) {

        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write("not found!");
        return res.end();

    }

    res.writeHead(200, {'Content-Type': 'text/' + type});
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

  switch (req.url) {

    case '/' :
      requestProcessor(res, 'tictactoe.html', 'html');
      break;

    case '/class.js':
      requestProcessor(res, 'class.js', 'javascript');
      break;

    case '/function.js':
      requestProcessor(res, 'function.js', 'javascript');
      break;

    case '/style.css':
      requestProcessor(res, 'css/style.css', 'css');
      break;

    default :
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write("wrong page");
      res.end();
      break;

  }
}

console.log("server listening ...");

var roomcount = [0, 0];
io.sockets.on('connection', function(socket){
  socket.on('emit_room', function(data){

    socket.join(data);
    var rnum = data.slice(5, data.length) - 1;
    roomcount[rnum] = (roomcount[rnum] + 1) % 2;
    socket.emit('emit_id', roomcount[rnum]);

  });

  socket.on('emit_from_client', function(data){
    socket.broadcast.to(data.room).emit('emit_from_enemy', data)
  });
});