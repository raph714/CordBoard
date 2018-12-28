var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db')
const uuidv1 = require('uuid/v1');


app.get('/', function(req, res){
  console.log('requested root');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  //get a unique id that can be used as an address
  //to recieve messages. Save some data (such as a public key)
  //that will be passed to anyone who requests it based on the uuid
  //through the dataForId route.
  //data: {obj} -> String
  socket.on('register', function(data) {
    var public = uuidv1();
    var private = uuidv1();
    db.register(data, public, private, function() {
      socket.emit('registerComplete', {public: public, private: private});
    });
  });

  //post a private_id to tell the server to associate your current
  //socket id with your public id so that you can be sent messages.
  socket.on('goOnline', function(private_id) {
    db.goOnline(private_id, socket.id, function(success) {
      socket.emit('goOnline', success);
    });
  });

  socket.on('disconnect', function(reason) {
    db.goOffline(socket.id);
  });
  
  //Get the associated data for a given address (id).
  //uuid: String
  socket.on('dataForId', function(uuid) {
    db.getData(uuid, function(data) {
      console.log(data);
      socket.emit('dataForId', data);
    });
  });
  
  //Send a message to one or more registered ids
  //data should be of format [{public_id: String, data: obj}, ...]
  socket.on('sendMessage', function(data) {
    var public_id = data['public_id'];
    db.getSocketId(public_id, function(socket_id) {
      console.log(socket.id, socket_id);
      io.to(socket_id).emit('messageReceive', data['data']);
      socket.emit('messageDidSend', data['data']);
    });
  });
});

http.listen(3307, function(){
  console.log('listening on *:3307');
});