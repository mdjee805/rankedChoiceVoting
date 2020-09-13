var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/* GET voteInRace page. */
router.get('/voteInRace/*', async(req, res, next) => {
  raceID = (req.url).split('/')[2]; //get raceID

  //get item names from raceID
  SQLquery = "SELECT DISTINCT r.raceID, i.name from races r inner join people p on r.raceID = p.raceID inner join items i on p.peopleID = i.peopleID WHERE r.raceID = " + raceID;
  try {
    var conn = await mysql.createConnection({
      host     : 'aavxjie8w3ouxn.c1c99xe1e5l7.us-west-1.rds.amazonaws.com',
      user     : 'newuser',
      password : 'newpassword',
      database : 'ranked',
      port     : 3306
    });

    //connect to database
    await conn.connect(function(err) {
      if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
      }
    });

    //query database
    await conn.query(SQLquery, (err, results) => {
      if(err) throw err;
      res.render('voteInRace', {items: results} ); //redirect to voteinRace page
    });
  }
  catch {
    res.render('error');
  }
  finally {
    conn.end(); //close connection
  }
});

module.exports = router;
