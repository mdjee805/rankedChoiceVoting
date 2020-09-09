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

class item {
  name = "";
  vote = 0;
}

/* GET results page. */
router.get('/results/*', async(req, res, next) => {
  let raceID = (req.url).split('/')[2];
  let SQLquery = "SELECT p.peopleID, i.name, i.priority FROM races r INNER JOIN people p ON r.raceID = p.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE r.raceID = " + raceID;
  let SQLquery2 = "SELECT MIN(peopleID) AS peopleID FROM people p INNER JOIN races r ON p.raceID = r.raceID WHERE r.raceID = " + raceID;

  let conn;
  try {
    conn = await pool.getConnection();
    SQLitems = await conn.query(SQLquery);
    let peopleID = await conn.query(SQLquery2);
    let SQLquery3 = await "SELECT Count(i.name) AS 'index' FROM races r INNER JOIN people p ON r.raceID = p.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE r.raceID = " + raceID + " AND p.peopleID = " + peopleID[0].peopleID;
    let SQLquery4 = await "SELECT i.name FROM races r INNER JOIN people p ON r.raceID = p.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE (r.raceID = " + raceID + " AND p.peopleID = " + peopleID[0].peopleID + ");";
    let SQLindex = await conn.query(SQLquery3);
    let names = await conn.query(SQLquery4);
    
    var maxi = new item();
    var items;
    do {
      items = new Array(SQLindex[0].index);
      for(let i = 0; i < items.length; ++i) {
        items[i] = new item();
        items[i].name = names[i].name;
      }
      
      processVoting(SQLitems, items);
      declareWinner(maxi, items);

      if(isTie(items)) {
        maxi.name = "TIE";
        maxi.vote = 1;
      }

      if(maxi.vote == 0) {
        cullItems(items, SQLitems);
      }

    }while(maxi.vote == 0);
  }
  catch {
    res.render('error');
  }
  finally {
    conn.end();
    res.render('results', {allVotes: items, winner: maxi} );
  }
});

function processVoting(SQLitems, items) {
  let personID = 0;
  for(let i = 0; i < SQLitems.length; ++i) {
    if(SQLitems[i].peopleID != personID && SQLitems[i].priority == 1) {
      for(let j = 0; j < items.length; ++j) {
        if(items[j].name == SQLitems[i].name) {
          items[j].vote += 1;
          personID = SQLitems[i].peopleID;
        }
      }
    }
  }
}

function declareWinner(maxi, items) {
  let totalVotes = 0;
  for(let i = 0; i < items.length; ++i) {
    totalVotes += items[i].vote;
    if(items[i].vote > maxi.vote) {
      maxi.name = items[i].name;
      maxi.vote = items[i].vote;
    }
  }
  if(maxi.vote/totalVotes <= .5)
    maxi.vote = 0;
}

function cullItems(items, SQLitems) {
  let mini = Infinity;
  for(let i = 0; i < items.length; ++i) {
    if(items[i].vote < mini && items[i].vote != 0) {
      mini = items[i].vote;
    }
  }
  for(let i = 0; i < items.length; ++i) {
    if(items[i].vote == mini) {
      for(let j = 0; j < SQLitems.length; ++j) {
        if(SQLitems[j].name == items[i].name) {
          for(let k = 0; k < SQLitems.length; ++k) {
            if(SQLitems[k].peopleID == SQLitems[j].peopleID && SQLitems[k].priority > SQLitems[j].priority)
              SQLitems[k].priority -= 1;
          }
          SQLitems.splice(j--, 1);
        }
      }
    }
  }
}

function isTie(items) {
  let maxVotes = 0;
  let maxTie = 0;
  for(let i = 0; i < items.length; ++i) {
    if (items[i].vote > maxVotes)
      maxVotes = items[i].vote;
    for (let j = i + 1; j < items.length; ++j) {
      if (items[i].vote == items[j].vote)
        maxTie = items[i].vote;
    }
  }
  if (maxTie == maxVotes)
    return true;
  return false;
}

module.exports = router;
