var express = require('express');
var router = express.Router();

/* GET createRace page. */
router.get('/createRace', function(req, res, next) {
  res.render('createRace');
});

module.exports = router;
