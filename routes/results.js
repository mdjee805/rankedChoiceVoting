var express = require('express');
var router = express.Router();
var mysql = require('mysql');

//simple class to send in data
class item {
  name = "";
  vote = 0;
}

/* GET results page. */
router.get('/results/*', async(req, res, next) => {
  let raceID = (req.url).split('/')[2]; //get raceID

  //query to get name and priority for each item in the race
  let SQLquery = "SELECT p.peopleID, i.name, i.priority FROM races r INNER JOIN people p ON r.raceID = p.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE r.raceID = " + raceID;

  //query to get all peopleIDs from a race
  let SQLquery2 = "SELECT MIN(peopleID) AS peopleID FROM people p INNER JOIN races r ON p.raceID = r.raceID WHERE r.raceID = " + raceID;

  try {
    //establish pool
    var pool = await mysql.createPool({
      host     : 'aavxjie8w3ouxn.c1c99xe1e5l7.us-west-1.rds.amazonaws.com',
      user     : 'newuser',
      password : 'newpassword',
      database : 'ranked',
      port     : 3306
    });

    //create connection to database
    await pool.getConnection(function(err, conn) {
      if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
      }

      //query name and priority from items
      conn.query(SQLquery, (err, results) => {
        if(err) throw err;
        SQLitems = results;

        //query peopleIDs
        conn.query(SQLquery2, (err, results) => {
          if(err) throw err;
          peopleID = results;

          //get how many items in the race
          let SQLquery3 = "SELECT Count(i.name) AS 'index' FROM races r INNER JOIN people p ON r.raceID = p.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE r.raceID = " + raceID + " AND p.peopleID = " + peopleID[0].peopleID;

          //get names of items from race
          let SQLquery4 = "SELECT i.name FROM races r INNER JOIN people p ON r.raceID = p.raceID INNER JOIN items i ON p.peopleID = i.peopleID WHERE (r.raceID = " + raceID + " AND p.peopleID = " + peopleID[0].peopleID + ");";

          //query to get items in the race (index)
          conn.query(SQLquery3, (err, results) => {
            if(err) throw err;
            SQLindex = results;

            //query to get names of items in the race
            conn.query(SQLquery4, (err, results) => {
              if(err) throw err;
              names = results;
    
              var maxi = new item();
              var items;
              do {
                //populate an items object
                items = new Array(SQLindex[0].index);
                for(let i = 0; i < items.length; ++i) {
                  items[i] = new item();
                  items[i].name = names[i].name;
                }
      
                processVoting(SQLitems, items); //add votes (all 1st choices)
                declareWinner(maxi, items); //declare winner if no tie for 1st place

                if(isTie(items)) { //if a tie, loop again
                  maxi.name = "TIE";
                  maxi.vote = 1;
                }

                if(maxi.vote == 0) { //if a tie, remove item with the fewest number of 1st place votes, if a tie, remove both/all
                  cullItems(items, SQLitems);
                }

              }while(maxi.vote == 0);
              pool.end(); //close database connection
              res.render('results', {allVotes: items, winner: maxi} ); //redirect to results page and send in data
            });
          });
        });
      });
    });
  }
  catch {
    res.render('error');
  }
});

function processVoting(SQLitems, items) { //total the number of first place votes
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

function declareWinner(maxi, items) { //declare a winner if no 1st place tie
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

function cullItems(items, SQLitems) { //finds the item(s) with the fewest 1st place votes then increases vote priority for all of that person's votes with lower priority (larger priority number)
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

function isTie(items) { //sees if there is a tie for 1st place
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
