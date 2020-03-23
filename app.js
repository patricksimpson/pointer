const express = require("express");
const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;

app.listen(port);

let rooms = [];
let users = {};

function handler (req, res) {}

io.on('connection', function (socket) {
  socket.emit('api', { data: 'world' });
  socket.on('start-session', function (data) {
    let roomId = makeid(12);
    socket.emit('create-room', { data: roomId});
    socket.join(roomId);
    console.log('create-room', data, roomId);
    rooms.push({id: roomId, users: []});
  });
  socket.on('join-session', function (data) {
    users[socket.id] = 'Unknown';
    const roomId = data.roomId;
    socket.emit('join', { data: roomId });
    let room = rooms.find((room) => roomId === room.id);
    if(room) {
      room.users.push(socket.id);
      roomUsers = room.users.map((id) => ({id, name: users[id]}));
      socket.join(roomId);
      io.to(roomId).emit('person-list', { users: roomUsers });
      io.to(roomId).emit('person-joined', { person: socket.id });
      socket.on('disconnect', function(data) {
        console.log('disconnect from ', socket.id);
        room.users = room.users.filter((user) => user !== socket.id);
        room.users.map((id) => ({id, name: users[id]}));
        delete users[socket.id];
        roomUsers = room.users.map((id) => ({id, name: users[id]}));
        io.to(roomId).emit('person-list', { users: roomUsers });
      });
      socket.on('person-update-name', function(data) {
        users[socket.id] = data.name;
        roomUsers = room.users.map((id) => ({id, name: users[id]}));
        io.to(roomId).emit('person-list', { users: roomUsers });
      });
    } else {
      socket.emit('no-such-room', { data: roomId });
    }
  });
});


function makeid(length) {
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWYXZ0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
