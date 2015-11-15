var app = require('http').createServer(handler),
    io = require('socket.io').listen(app)
    fs = require('fs');
app.listen(1337);
io.set('log level', 1);
function handler(req, res) {
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
}
console.log("server listening ...");

io.sockets.on('connection', function(socket){
    socket.on('emit_from_client', function(data){
        io.sockets.emit('emit_from_server', data)
        console.log(data);
    });
});