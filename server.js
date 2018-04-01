/*************************************************************
 * Project Name: Chat App
 * File Name: server.js
 *
 * Author: Ian Petty
 *
 * IMPORTANT:
 * -
 ************************************************************/

//Module Dependencies
var express = require('express');
var app = express();
//HTTP Server built using express library
var server = require('http').createServer(app);
// Used for user input of host and port
var io = require('socket.io').listen(server);
var handler = require('./handler');
var yargs = require('yargs');

const argv = yargs.argv;

// Gets host and port straight from command line
// through keyword recognition
// e.g. 'node server --host=10.0.1.1 --port=4567'
var host = argv.host;
var port = argv.port;

// Set up the express static server directory in the public
// folder in this directory
app.use(express.static(__dirname + '/public'));

var usernames = [];

io.sockets.on('connection', function(socket) {

  // Socket used for when a new user connects to server
  socket.on('new user', function(data) {

    var usernameTaken;

    // Check if username is taken
    usernames.forEach(function(name) {
      if (name === data.username) {
            usernameTaken = true;
        return;
      }
    });

    // Tell user the name is taken
    if (usernameTaken) {
      socket.emit('username is taken');
    } else {
      // Else create username and add it to usernames
      socket.set("username", data.username, function() {
        usernames.push(data.username);

        // Welcome the new user
        socket.emit('welcome', data.username, usernames);

        // Let all others know a new user has joined
        socket.broadcast.emit('user joined', data.username, usernames);
      });
    }
  });

  // Listening socket for outgoing messages
  socket.on('outgoing', function(data) {

    // New message from a specific user
    socket.get('username', function(err, username) {
      var eventArgs = {
        username: username,
        message: data.message
      };

      // Message sent to oneself
      socket.emit('incoming', eventArgs, true);

      // Messages sent to all others
      socket.broadcast.emit('incoming', eventArgs, false);
    });
  });

  // Listening socket for when someone leaves the chat
  socket.on('disconnect', function() {

    socket.get('username', function(err, username) {

      // Remove username from the list of current usernames
      usernames.splice(usernames.indexOf(username), 1);

      if (usernames.length === 0 ) return;

      socket.broadcast.emit('user left', username, usernames);
    });

    console.log('user disconnected!');
  });
});

server.listen(port, host);

app.get('/', handler);
