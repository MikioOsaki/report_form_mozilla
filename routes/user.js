var express = require('express');
var router = express.Router();

var report_contorller_user = require('../controllers/reportControllerUser');

// GET request for creating a report. NOTE This must come before routes that display report (uses id).
router.get('/report/create', report_contorller_user.report_create_get);

// POST request for creating report.
router.post('/report/create', report_contorller_user.report_create_post);

// GET user home page.
router.get('/', report_contorller_user.user_index);

module.exports = router;
