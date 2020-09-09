var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var maria = require('mariadb');

var indexRouter = require('./routes/index');
var createRaceRouter = require('./routes/createRace');
var selectRaceRouter = require('./routes/selectRace');
var voteInRaceRouter = require('./routes/voteInRace');
var selectRaceResultsRouter = require('./routes/selectRaceResults');
var resultsRouter = require('./routes/results');
var usersRouter = require('./routes/users');

var app = express();

const hostname = '127.0.0.1';
const port = 8080;
const pool = maria.createPool ({
  host: '127.0.0.1',
  user: 'newuser',
  password: 'newpassword',
  database: 'ranked',
  connectionLimit: 5,
  port:3306
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.get('/createRace', createRaceRouter);
app.get('/selectRace', selectRaceRouter);
app.get('/voteInRace/*', voteInRaceRouter);
app.get('/selectRaceResults', selectRaceResultsRouter);
app.get('/results/*', resultsRouter);
app.use('/users', usersRouter);

app.post('/newRace', async(req, res) => {
  var name = [];
  var rank = [];
  if(req.body.name1 != null)
    name[0] = req.body.name1;
  if(req.body.rank1 != null)
    rank[0] = req.body.rank1;
  if(req.body.name2 != null)
    name[1] = req.body.name2;
  if(req.body.rank2 != null)
    rank[1] = req.body.rank2;
  if(req.body.name3 != null)
    name[2] = req.body.name3;
  if(req.body.rank3 != null)
    rank[2] = req.body.rank3;
  if(req.body.name4 != null)
    name[3] = req.body.name4;
  if(req.body.rank4 != null)
    rank[3] = req.body.rank4;
  if(req.body.name5 != null)
    name[4] = req.body.name5;
  if(req.body.rank5 != null)
    rank[4] = req.body.rank5;
  if(req.body.name6 != null)
    name[5] = req.body.name6;
  if(req.body.rank6 != null)
    rank[5] = req.body.rank6;
  if(req.body.name7 != null)
    name[6] = req.body.name7;
  if(req.body.rank7 != null)
    rank[6] = req.body.rank7;
  if(req.body.name8 != null)
    name[7] = req.body.name8;
  if(req.body.rank8 != null)
    rank[7] = req.body.rank8;
  if(req.body.name9 != null)
    name[8] = req.body.name9;
  if(req.body.rank9 != null)
    rank[8] = req.body.rank9;
  if(req.body.name10 != null)
    name[9] = req.body.name10;
  if(req.body.rank10 != null)
    rank[9] = req.body.rank10;
  
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('INSERT INTO races() VALUES ();');
    raceID = await conn.query('SELECT MAX(raceID) AS raceID from races;');
    SQLpeople = await 'INSERT INTO people (raceID) VALUES ("' + raceID[0].raceID + '");';
    await conn.query(SQLpeople);
    peopleID = await conn.query('SELECT MAX(peopleID) as peopleID from people;');
    SQLitems = await "INSERT INTO items (peopleID, name, priority) VALUES";
    for(i = 0; i < 10 && name[i] != '' && rank[i] != ''; ++i) {
      SQLitems += " (" + peopleID[0].peopleID + ", '" + name[i] + "', " + rank[i] + ")";
      if(i == 9)
        SQLitems += ";";
      else {
        if(name[i + 1] != '' && rank[i + 1] != '')
          SQLitems += ",";
        else
          SQLitems += ";";
      }
    }
    await conn.query(SQLitems);
  }
  catch {
    createError(404);
  }
  finally {
    conn.end();
    res.render('index');
  }
});

app.post('/sendVote/*', async(req, res) => {
  raceID = (req.url).split('/')[2];
  var rank = [];
  if(req.body.priority0 != null)
    rank[0] = req.body.priority0;
  if(req.body.priority1 != null)
    rank[1] = req.body.priority1;
  if(req.body.priority2 != null)
    rank[2] = req.body.priority2;
  if(req.body.priority3 != null)
    rank[3] = req.body.priority3;
  if(req.body.priority4 != null)
    rank[4] = req.body.priority4;
  if(req.body.priority5 != null)
    rank[5] = req.body.priority5;
  if(req.body.priority6 != null)
    rank[6] = req.body.priority6;
  if(req.body.priority7 != null)
    rank[7] = req.body.priority7;
  if(req.body.priority8 != null)
    rank[8] = req.body.priority8;
  if(req.body.priority9 != null)
    rank[9] = req.body.priority9;
  
  let conn;
  try {
    conn = await pool.getConnection();
    SQLnames = await "SELECT DISTINCT i.name AS name FROM races r INNER JOIN people p ON p.raceID = r.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE r.raceID = " + raceID + ";";
    names = await conn.query(SQLnames);
    SQLpeople = await 'INSERT INTO people (raceID) VALUES ("' + raceID + '");';
    await conn.query(SQLpeople);
    peopleID = await conn.query('SELECT MAX(peopleID) as peopleID from people;');
    SQLitems = await "INSERT INTO items (peopleID, name, priority) VALUES";

    for(i = 0; i < names.length && names[i].name != '' && rank[i] != ''; ++i) {
      SQLitems += " (" + peopleID[0].peopleID + ", '" + names[i].name + "', " + rank[i] + ")";
      if(i < names.length - 1)
          SQLitems += ",";
      else
        SQLitems += ";";
    }
    console.log(SQLitems);
    await conn.query(SQLitems);
  }
  catch {
    createError(404);
  }
  finally {
    conn.end();
    res.render('index');
  }
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

module.exports = app;
