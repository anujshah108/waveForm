var path = require('path');
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var bodyParser = require("body-parser");
var request = require('request');
var cors = require('cors');

var app  = express();
var audiouploaded = path.resolve(__dirname, 'public/tmp/audioup.mp3');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
};

app.use(allowCrossDomain);

// app.use(cors());

app.get('/', function(req, res){
  res.status(200).end();
});

app.post('/upload', function(req, res) {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  var temp_dir = path.resolve(__dirname, 'public/tmp/');
  if (!fs.existsSync(temp_dir)) {
    fs.mkdirSync(temp_dir);
  }

  let audioFile = req.files.audioFile;
  audioFile.mv(audiouploaded, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.sendFile(audiouploaded);
  });
});

var port = process.env.PORT || 8080;

var server = app.listen(port, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// exports = module.exports = app;
