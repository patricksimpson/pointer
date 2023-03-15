const express = require("express");
const app = require("http").createServer();
const io = require("socket.io")(app);
const fs = require("fs");
const socketIo = require("socket.io");
const port = process.env.PORT || 4002;

app.listen(port);

let rooms = [];
let users = {};
let viewers = {};
let votes = {};
let waffles = {};

const SERVER_STATUS = "server-status";

const START_SESSION = "start-session";
const JOIN_SESSION = "join-session";
const NO_SESSION = "no-session";

const CREATE_ROOM = "create-room";
const JOIN_ROOM = "join-room";
const LEAVE_ROOM = "leave-room";
const DISCONNECT = "disconnect";

const UPDATE_NAME = "person-update-name";
const UPDATE_ROOM = "person-list";
const PERSON_JOIN = "person-joined";
const NO_ROOM = "no-such-room";
const PROMOTE_USER = "promote-user";
const PROMOTED_USER = "promoted-user";

// Voting
const ROOM_SHOW_VOTES = "room-show-votes";
const ROOM_HIDE_VOTES = "room-hide-votes";
const ROOM_CLEAR_VOTES = "room-clear-votes";
const CAST_VOTE = "cast-vote";

const USERS_ONLINE = "users-online";
const ROOMS_ONLINE = "rooms-online";

const JOINED_ROOM = "joined-room";

const DEFAULT_NAME = " ... ";

const LAUNCH = "fire";

const MAX_NAME_LENGTH = 26;

function handler(req, res) {}

io.on("connection", function (socket) {
  adviseServerStatus(socket);
  socket.on(START_SESSION, function (data) {
    createRoom(socket, data);
  });

  socket.on(DISCONNECT, function (data) {
    delete users[socket.id];
    delete viewers[socket.id];
    delete votes[socket.id];
    delete waffles[socket.id];
    adviseServerStatus(socket);
  });

  socket.on(JOIN_SESSION, function (data) {
    const roomId = data.roomId;
    let room = getRoom(roomId);

    if (room) {
      // Private message to user, room id and user id of current user;
      io.to(socket.id).emit(JOINED_ROOM, {
        roomId,
        userId: socket.id,
        startTime: room.startTime,
      });
    } else {
      io.to(socket.id).emit(NO_SESSION, {
        userId: socket.id,
      });
    }

    if (room) {
      users[socket.id] = DEFAULT_NAME;
      adviseServerStatus(socket);
      joinRoom(roomId, socket);
      log(JOIN_ROOM, roomId);

      socket.on(LAUNCH, function (data) {
        io.to(roomId).emit(LAUNCH);
      });

      socket.on(LEAVE_ROOM, function (data) {
        leaveRoom(roomId, socket);
        log(LEAVE_ROOM, { roomId, id: socket.id });
      });

      socket.on(DISCONNECT, function (data) {
        leaveRoom(roomId, socket);
        log(LEAVE_ROOM, { roomId, id: socket.id });
      });
      socket.on(UPDATE_NAME, function (data) {
        users[socket.id] = data.name.substring(0, MAX_NAME_LENGTH).trim();
        if (data.observer) {
          viewers[socket.id] = true;
        }
        adviseRoom(roomId, socket);
      });
      socket.on(PROMOTE_USER, function (data) {
        promoteUser(roomId, data.userId);
        adviseRoom(roomId, socket);
      });
      socket.on(CAST_VOTE, function (data) {
        if (!waffles[socket.id]) {
          waffled =
            votes[socket.id] != -1 &&
            votes[socket.id] != data.vote &&
            data.vote != false;
        }
        waffles[socket.id] = waffled;
        votes[socket.id] = data.vote;
        adviseRoom(roomId, socket);
      });
      socket.on(ROOM_SHOW_VOTES, function (data) {
        room.showVotes = true;
        waffles = {};
        adviseRoom(roomId, socket);
        io.to(roomId).emit(ROOM_SHOW_VOTES);
      });
      socket.on(ROOM_HIDE_VOTES, function (data) {
        room.showVotes = false;
        waffles = {};
        adviseRoom(roomId, socket);
        io.to(roomId).emit(ROOM_HIDE_VOTES);
      });
      socket.on(ROOM_CLEAR_VOTES, function (data) {
        room.showVotes = false;
        waffles = {};
        clearVotes(roomId, socket);
        io.to(roomId).emit(ROOM_HIDE_VOTES, { data: "new" });
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
  if (!room) {
    return false;
  }
  return room.users.map((id) => ({
    id,
    name: users[id],
    new: users[id] == DEFAULT_NAME,
    vote: getVote(id, roomId),
    leaderUser: getLeaderUser(id, roomId),
    waffled: getWaffled(id),
    observer: getObserver(id),
  }));
}

function getRoomVotes(roomId) {
  let room = getRoom(roomId);
  if (!room) {
    return false;
  }
  return room.votes;
}

function getLeaderUser(id, roomId) {
  let room = getRoom(roomId);
  return room.leaderUser === id;
}

function getVote(id, roomId) {
  let room = getRoom(roomId);
  return room.showVotes ? votes[id] : !!votes[id];
}

function getWaffled(id) {
  return waffles[id];
}

function getObserver(id) {
  return viewers[id];
}

function leaveRoom(roomId, socket) {
  let room = getRoom(roomId);
  if (room) {
    room.users = room.users.filter((user) => user !== socket.id);
    if (room.users.length < 1) {
      deleteRoom(roomId);
      adviseServerStatus(socket);
    }
    adviseRoom(roomId, socket);
  }
  delete users[socket.id];
  delete votes[socket.id];
  delete viewers[socket.id];
  delete waffles[socket.id];
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
  let roomVotes = getRoomVotes(roomId);
  io.to(roomId).emit(UPDATE_ROOM, {
    viewers: viewers,
    users: roomUsers,
    votes: roomVotes,
  });
}

function clearVotes(roomId, socket) {
  let roomUsers = getRoomUsers(roomId, socket);
  if (!roomUsers) {
    return;
  }
  roomUsers.forEach((user) => removeVote(user.id));
  adviseRoom(roomId, socket);
}

function removeVote(id) {
  votes[id] = null;
  waffles[id] = null;
}

function promoteUser(roomId, socketId) {
  let room = getRoom(roomId);
  room.leaderUser = socketId;
  io.to(roomId).emit(PROMOTED_USER, { id: socketId });
}

function joinRoom(roomId, socket) {
  let room = getRoom(roomId);
  if (room.users < 1) {
    setTimeout(() => {
      promoteUser(roomId, socket.id);
    }, 150);
  }
  room.users.push(socket.id);
  socket.join(roomId);
  adviseRoom(roomId, socket);
}

function createRoom(socket, data) {
  let time = Date.now();
  let roomId = makeId(12);
  io.emit(CREATE_ROOM, { data: roomId, votes: data.votes });
  socket.join(roomId);
  let room = {
    id: roomId,
    users: [],
    showVotes: false,
    votes: data.votes,
    startTime: time,
  };
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
    rooms: roomsOnline(),
  };
  socket.emit(SERVER_STATUS, data);
  socket.broadcast.emit(SERVER_STATUS, data);
}

function log(msg, data = null) {
  console.log(msg, data);
}

function makeId(length) {
  var result = "";
  var characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWYXZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
