var express = require('express');
var mongo = require('mongodb')
var uuid = require('node-uuid');
var fs = require('fs');

// Set up database
var mongo_host = process.env.MONGO_HOST || 'localhost';
var mongo_port = parseInt(process.env.MONGO_PORT, 10);
if (isNaN(mongo_port)) mongo_port = 27017;
var mongo_db = process.env.MONGO_DB || 'scratchdb';
var mongo_user = process.env.MONGO_USER;
var mongo_password = process.env.MONGO_PASSWORD;
var db = new mongo.Db(mongo_db, new mongo.Server(mongo_host, mongo_port, {}), {});

/*
 * Routes are split into separate modules.
 */
var forms = require('./forms');
var responses = require('./responses');
var collectors = require('./collectors');
var surveys = require('./surveys');
var scans = require('./scans');

RESPONSES = 'responseCollection';
FORMS = 'formCollection';
COLLECTORS = 'collectorCollection';
SURVEYS = 'surveyCollection';
SCANIMAGES = 'scanCollection';

var app = express.createServer(express.logger());

app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
});

// ID generator
var idgen = uuid.v1;

// Set up routes for forms
forms.setup(app, db, idgen, FORMS);
responses.setup(app, db, idgen, RESPONSES);
collectors.setup(app, db, idgen, COLLECTORS);
surveys.setup(app, db, idgen, SURVEYS);
scans.setup(app, db, idgen, SCANIMAGES);

// Static files
// TODO: host these separately? Shift other routes to /api/ROUTES?
function sendFile(response, filename, type) {
  fs.readFile('static/' + filename, function(err, data) {
    if (err) {
      console.log(err.message);
      response.send(500);
      return;
    }
    response.header('Content-Type', type);
    response.send(data);
  });
}

app.get('/', function(req, response) {
  response.redirect('/static/progress.html');
});

app.get(/\/static\/(.*)/, function(req, response) {
  var path = req.params[0];
  var index = path.lastIndexOf('.');
  var format = '';
  if (index > -1) {
    format = path.substring(index);
  }

  var type;
  switch (format) {
  case '.html':
    type = 'text/html';
    break;
  case '.css':
    type = 'text/css';
    break;
  case '.js':
    type = 'application/javascript';
    break;
  case '.gif':
    type = 'image/gif';
    break;
  default:
    type = 'text/html';
  }

  sendFile(response, path, type);
});

function startServer() {
  var port = process.env.PORT || 3000;
  app.listen(port, function() {
    console.log('Listening on ' + port);
  });
}

// Kick things off
console.log('Using the following settings:');
console.log('Port: ' + process.env.PORT || 3000);
console.log('Mongo host: ' + mongo_host);
console.log('Mongo port: ' + mongo_port);
console.log('Mongo db: ' + mongo_db);
console.log('Mongo user: ' + mongo_user);
db.open(function() {
  if (mongo_user != undefined) {
    db.authenticate(mongo_user, mongo_password, function(err, result) {
      if (err) {
        console.log(err.message);
        return;
      }
      startServer();
    });
  } else {
    startServer();
  }
});

