var express = require('express');
var router = express.Router();
var maria = require('mariadb');

const pool = maria.createPool ({
  host: '127.0.0.1',
  user: 'newuser',
  password: 'newpassword',
  database: 'ranked',
  connectionLimit: 5,
  port:3306
});

/* GET selectRace page. */
router.get('/selectRace', async(req, res, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    SQLitems1 = await conn.query('SELECT raceID from races ORDER BY raceID DESC;');
    SQLitems2 = await conn.query('SELECT DISTINCT r.raceID, i.name from races r inner join people p on r.raceID = p.raceID inner join items i on p.peopleID = i.peopleID ORDER BY raceID DESC;');
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
  }
  catch {
    res.render('error');
  }
  finally {
    conn.end();
    res.render('selectRace', {races: data} );
  }
});

module.exports = router;
