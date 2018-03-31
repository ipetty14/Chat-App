/*************************************************************
 * Project Name: Chat App
 * File Name: handler.js
 *
 * Author: Ian Petty
 *
 * IMPORTANT:
 * -
 ************************************************************/

var fs = require('fs');

module.exports = function handler (req, res) {
  fs.readFile(__dirname + '/html/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('ERROR: Could not load index.html');
    }

    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(data);
  });
};
