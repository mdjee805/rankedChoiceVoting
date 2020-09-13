var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/* GET selectRace page. */
router.get('/selectRaceResults', async(req, res, next) => {
  try {
    //establish pool
    var pool = await mysql.createPool({
      host     : 'aavxjie8w3ouxn.c1c99xe1e5l7.us-west-1.rds.amazonaws.com',
      user     : 'newuser',
      password : 'newpassword',
      database : 'ranked',
      port     : 3306
    });

    //connect to database
    await pool.getConnection(function(err, conn) {
      if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
      }

      //get every raceID
      conn.query('SELECT raceID from races ORDER BY raceID DESC;', (err, results) => {
        if(err) throw err;
        SQLitems1 = results;

         //get every raceID's item names
         conn.query('SELECT DISTINCT r.raceID, i.name from races r inner join people p on r.raceID = p.raceID inner join items i on p.peopleID = i.peopleID ORDER BY raceID DESC;', (err, results) => {
          if(err) throw err;
          SQLitems2 = results;

          //reformat data into usable array
          data = new Array(SQLitems1.length);
          for(let i = 0; i < SQLitems1.length; ++i) {
            let k = 0;
            for(let j = 0; j < SQLitems2.length; ++j) {
              if(SQLitems1[i].raceID == SQLitems2[j].raceID) {
                if(k == 0) {
                  data[i] = [];
                  data[i][k++] = SQLitems1[i].raceID;
                }
              data[i][k++] = SQLitems2[j].name;
              }
            }
          }
          res.render('selectRaceResults', {races: data} ); //redirect and send array in
          pool.end(); //close pool
        });
      });
    });
  }
  catch {
    res.render('error');
  }
});

module.exports = router;
