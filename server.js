/*
COMP 2406 Collision Demo
(c) Louis D. Nel 2018

This example is based on the collision geometry math presented in
assignment #3 (fall 2018).
Some of the variable names (e.g. angle_d) correspond to those
presented in the powerpoint slides with the assignment.

This code is intended to serve as the base code for building
an online multi-player game where clients are kept in synch
through a server -presumably using the socket.io npm module.


Use browser to view pages at http://localhost:3000/collisions.html
*/

//Server Code
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require("fs") //needed if you want to read and write files
const url = require("url") //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", //should really be application/javascript
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  //Get MIME type based on extension of requested file name
  //e.g. index.html --> text/html
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })
}

let players = {
  home: null,
  visitor: null
};

let currentGameStatus = {};

io.on('connection', function(socket) {
  console.log('A user connected');

  socket.emit('updatePlayerStatus', players);

  socket.on('playerJoin', function(data) {
    let updated = false; 

    if(data.role === 'home' && !players.home) {
      players.home = socket.id;
      updated = true;
    } else if(data.role === 'visitor' && !players.visitor) {
      players.visitor = socket.id;
      updated = true;
    }

    if (updated) {
      io.emit('updatePlayerStatus', players);
      //socket.emit('playerJoined', { role: data.role });
      socket.broadcast.emit('playerJoined', { role: data.role });
    } else if (data.role === 'spectator'){
      socket.emit('updateGameStatus', currentGameStatus);
    }
  });

  socket.on('aimingStart', function(mouseLocation) {
    socket.broadcast.emit('playerAimingStart', mouseLocation);
  });

  socket.on('aimingMove', function(data) {
    socket.broadcast.emit('playerAimingMove', data);
  });

  socket.on('startShooting', function(data) {
    socket.broadcast.emit('disableShooting', data); 
  });

  socket.on('endShooting', function(data) {
    currentGameStatus.stonesData = data.stonesData;
    currentGameStatus.queueData = data.queueData;
    socket.broadcast.emit('enableShooting');
  });

  socket.on('restart', function() {
    socket.broadcast.emit('regroup');
  });

  socket.on('disconnect', function() {
    console.log('A user disconnected.');

    if(players.home == socket.id && players.visitor == socket.id) {
      players.home = null;
      players.visitor = null;
      io.emit('playerLeft', { role: 'home' });
      io.emit('playerLeft', { role: 'visitor' });
    } else if(players.home == socket.id) {
      players.home = null;
      io.emit('playerLeft', { role: 'home' });
    } else if(players.visitor == socket.id) {
      players.visitor = null;
      io.emit('playerLeft', { role: 'visitor' });
    }
  });
});

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log("http://localhost:3000/curling.html")

