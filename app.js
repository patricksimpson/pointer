const express = require("express");
const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;

app.listen(port);

let rooms = [];
let users = {};
let votes = {};

const START_SESSION = 'start-session';
const JOIN_SESSION = 'join-session';

const CREATE_ROOM = 'create-room';
const JOIN_ROOM = 'join-room';
const LEAVE_ROOM = 'leave-room';
const DISCONNECT = 'disconnect';

const UPDATE_NAME = 'person-update-name';
const UPDATE_ROOM = 'person-list';
const PERSON_JOIN = 'person-joined';
const NO_ROOM = 'no-such-room';


// Voting
const ROOM_SHOW_VOTES = 'room-show-votes';
const ROOM_HIDE_VOTES = 'room-hide-votes';
const ROOM_CLEAR_VOTES = 'room-clear-votes';
const CAST_VOTE = 'cast-vote';

const JOINED_ROOM = 'joined-room';

const DEFAULT_NAME = '...';


function handler (req, res) {}

io.on('connection', function (socket) {
  socket.emit('api', { data: 'Server Online' });

  socket.on(START_SESSION, function (data) {
    createRoom(socket, data);
  });

  socket.on(JOIN_SESSION, function (data) {
    console.log(JOIN_SESSION, data);
    const roomId = data.roomId;
    let room = getRoom(roomId);
    users[socket.id] = DEFAULT_NAME;

    // Private message to user, room id and user id of current user;
    io.to(socket.id).emit(JOINED_ROOM, { roomId, userId: socket.id});

    if(room) {
      joinRoom(roomId, socket);
      socket.on([LEAVE_ROOM, DISCONNECT], function(data) {
        leaveRoom(roomId, socket);
      });
      socket.on(DISCONNECT, function(data){
        delete users[socket.id];
      });
      socket.on(UPDATE_NAME, function(data) {
        users[socket.id] = data.name;
        adviseRoom(roomId, socket);
      });
      socket.on(CAST_VOTE, function(data) {
        votes[socket.id] = data.vote;
        adviseRoom(roomId, socket);
        console.log(CAST_VOTE, data);
      });
      socket.on(ROOM_SHOW_VOTES, function(data) {
        room.showVotes = true;
        io.to(roomId).emit(ROOM_SHOW_VOTES);
      });
      socket.on(ROOM_HIDE_VOTES, function(data) {
        room.showVotes = false;
        io.to(roomId).emit(ROOM_HIDE_VOTES);
      });
      socket.on(ROOM_CLEAR_VOTES, function(data) {
        room.showVotes = false;
        clearVotes(roomId, socket);
        io.to(roomId).emit(ROOM_HIDE_VOTES);
      });

    } else {
      socket.emit(NO_ROOM, { data: roomId });
    }
  });
});

function getRoom(roomId) {
  return rooms.find((room) => roomId === room.id);
}

function getRoomUsers(roomId) {
  let room = getRoom(roomId);
  return room.users.map((id) => ({id, name: users[id], vote: getVote(id, roomId)}));
}

function getVote(id, roomId) {
  let room = getRoom(roomId);
  return room.showVotes ? votes[id] : !!votes[id];
}

function leaveRoom(roomId, socket) {
  let room = getRoom(roomId);
  room.users = room.users.filter((user) => user !== socket.id);
  adviseRoom(roomId, socket);
  console.log(LEAVE_ROOM, socket.id);
}

function adviseRoom(roomId, socket) {
  let roomUsers = getRoomUsers(roomId);
  io.to(roomId).emit(UPDATE_ROOM, { users: roomUsers });
  console.log(UPDATE_ROOM, roomId);
}

function clearVotes(roomId, socket) {
  let roomUsers = getRoomUsers(roomId, socket);
  console.log(roomUsers);
  roomUsers.forEach((user) => removeVote(user.id));
  adviseRoom(roomId, socket);
}

function removeVote(id) {
  votes[id] = null;
}

function joinRoom(roomId, socket) {
  let room = getRoom(roomId);
  room.users.push(socket.id);
  socket.join(roomId);
  adviseRoom(roomId, socket);
  console.log(JOIN_ROOM, roomId);
}

function createRoom(socket, data) {
  let roomId = makeId(12);
  socket.emit(CREATE_ROOM, { data: roomId});
  socket.join(roomId);
  let room = {id: roomId, users: [], showVotes: false};
  rooms.push(room);
  console.log(CREATE_ROOM, data, room);
}

function makeId(length) {
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWYXZ0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
