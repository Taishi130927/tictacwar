var app = require('http').createServer(handler),
    io = require('socket.io').listen(app)
    fs = require('fs');
app.listen(1337);
//io.set('log level', 1);
function handler(req, res) {
    switch (req.url) {
        case '/' :
            fs.readFile(__dirname + '/tictactoe.html', 'utf-8', function(err, data) {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write("not found!");
                    return res.end();
                }
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            });
            break;
        case '/class.js':
            fs.readFile(__dirname + '/class.js', 'utf-8', function(err, data) {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write("not found!");
                    return res.end();
                }
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                res.write(data);
                res.end();
            });
            break;
        case '/style.css':
            fs.readFile(__dirname + '/style.css', 'utf-8', function(err, data) {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write("not found!");
                    return res.end();
                }
                res.writeHead(200, {'Content-Type': 'text/css'});
                res.write(data);
                res.end();
            });
            break;
        default :
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write("wrong page");
            res.end();
            break;
    }
}

console.log("server listening ...");

io.sockets.on('connection', function(socket){
    socket.on('emit_room', function(data){
        socket.join(data);
    });
    socket.on('emit_from_client', function(data){
        socket.broadcast.to(data.room).emit('emit_from_enemy', data)
    });
});