var express = require('express');
var router = express.Router();

//var report_contorller = require('../controllers/reportController');

// GET home page.
router.get('/', function(req, res) {
  res.redirect('/administration');
});

// GET request for creating a report. NOTE This must come before routes that display report (uses id).
//router.get('/report/create', report_contorller.report_create_get);

// POST request for creating report.
//router.post('/report/create', report_contorller.report_create_post);

module.exports = router;
