const express = require("express");
const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');
const socketIo = require("socket.io");
const port = process.env.PORT || 4002;

app.listen(port);

let rooms = [];
let users = {};
let votes = {};

const SERVER_STATUS = 'server-status';

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

const USERS_ONLINE = 'users-online';
const ROOMS_ONLINE = 'rooms-online';

const JOINED_ROOM = 'joined-room';

const DEFAULT_NAME = '...';

const MAX_NAME_LENGTH = 26;


function handler (req, res) {}

io.on('connection', function (socket) {
  adviseServerStatus(socket);
  socket.on(START_SESSION, function (data) {
    createRoom(socket, data);
  });

  socket.on(DISCONNECT, function(data){
    delete users[socket.id];
    delete votes[socket.id];
    adviseServerStatus(socket);
  });

  socket.on(JOIN_SESSION, function (data) {
    const roomId = data.roomId;
    let room = getRoom(roomId);

    // Private message to user, room id and user id of current user;
    io.to(socket.id).emit(JOINED_ROOM, { roomId, userId: socket.id});

    if(room) {
      users[socket.id] = DEFAULT_NAME;
      adviseServerStatus(socket);
      joinRoom(roomId, socket);
      log(JOIN_ROOM, roomId);

      socket.on(LEAVE_ROOM, function(data) {
        leaveRoom(roomId, socket);
        log(LEAVE_ROOM, {roomId, id: socket.id});
      });

      socket.on(DISCONNECT, function(data) {
        leaveRoom(roomId, socket);
        log(LEAVE_ROOM, {roomId, id: socket.id});
      });
      socket.on(UPDATE_NAME, function(data) {
        users[socket.id] = data.name.substring(0, MAX_NAME_LENGTH).trim();
        adviseRoom(roomId, socket);
      });
      socket.on(CAST_VOTE, function(data) {
        votes[socket.id] = data.vote;
        adviseRoom(roomId, socket);
      });
      socket.on(ROOM_SHOW_VOTES, function(data) {
        room.showVotes = true;
        adviseRoom(roomId, socket);
        io.to(roomId).emit(ROOM_SHOW_VOTES);
      });
      socket.on(ROOM_HIDE_VOTES, function(data) {
        room.showVotes = false;
        adviseRoom(roomId, socket);
        io.to(roomId).emit(ROOM_HIDE_VOTES);
      });
      socket.on(ROOM_CLEAR_VOTES, function(data) {
        room.showVotes = false;
        clearVotes(roomId, socket);
        io.to(roomId).emit(ROOM_HIDE_VOTES);
      });

    } else {
      socket.emit(NO_ROOM, { data: roomId });
      log(NO_ROOM, roomId);
    }
  });
});

function getRoom(roomId) {
  return rooms.find((room) => roomId === room.id);
}

function getRoomUsers(roomId) {
  let room = getRoom(roomId);
  if (!room) { return false; }
  return room.users.map((id) => ({id, name: users[id], vote: getVote(id, roomId)}));
}

function getVote(id, roomId) {
  let room = getRoom(roomId);
  return room.showVotes ? votes[id] : !!votes[id];
}

function leaveRoom(roomId, socket) {
  let room = getRoom(roomId);
  if(room) {
    room.users = room.users.filter((user) => user !== socket.id);
    if (room.users.length < 1) {
      deleteRoom(roomId);
      adviseServerStatus(socket);
    }
    adviseRoom(roomId, socket);
  }
  delete users[socket.id];
  delete votes[socket.id];
}

function cleanUpRooms(socket) {
  rooms.forEach((room) => {
    let roomUsers = getRoomUsers(room.id);
    if (roomUsers.length < 1) {
      deleteRoom(room.id);
      adviseServerStatus(socket);
    }
  });
}

function deleteRoom(roomId) {
  let index = rooms.findIndex((room) => room.id === roomId);
  if (index > -1) {
    rooms.splice(index, 1);
  }
}

function adviseRoom(roomId, socket) {
  let roomUsers = getRoomUsers(roomId);
  io.to(roomId).emit(UPDATE_ROOM, { users: roomUsers });
}

function clearVotes(roomId, socket) {
  let roomUsers = getRoomUsers(roomId, socket);
  if (!roomUsers) { return; }
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
}

function createRoom(socket, data) {
  let roomId = makeId(12);
  io.emit(CREATE_ROOM, { data: roomId});
  socket.join(roomId);
  let room = {id: roomId, users: [], showVotes: false};
  rooms.push(room);
  adviseServerStatus(socket);
}

function usersOnline() {
  return Object.keys(users).length;
}

function roomsOnline() {
  return rooms.length;
}

function adviseServerStatus(socket) {
  let data = {
    status: true,
    users: usersOnline(),
    rooms: roomsOnline()
  };
  socket.emit(SERVER_STATUS, data);
  socket.broadcast.emit(SERVER_STATUS, data);
}

function log(msg, data = null) {
  console.log(msg, data);
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
