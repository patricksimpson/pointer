const express = require("express");
const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');

const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

app.listen(port);

function handler (req, res) {}

io.on('connection', function (socket) {
  socket.emit('api', { data: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
