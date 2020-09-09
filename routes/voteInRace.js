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

/* GET voteInRace page. */
router.get('/voteInRace/*', async(req, res, next) => {
  raceID = (req.url).split('/')[2];

  let conn;    
  let SQLitems;
  SQLquery = "SELECT DISTINCT r.raceID, i.name from races r inner join people p on r.raceID = p.raceID inner join items i on p.peopleID = i.peopleID WHERE r.raceID = " + raceID;
  try {
    conn = await pool.getConnection();
    SQLitems = await conn.query(SQLquery);
  }
  catch {
    res.render('error');
  }
  finally {
    conn.end();
    res.render('voteInRace', {items: SQLitems} );
  }
});

module.exports = router;
