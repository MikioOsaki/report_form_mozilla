var express = require('express');
var router = express.Router();

// Require controller modules.
var report_contorller = require('../controllers/reportController');
var bathingspot_controller = require('../controllers/bathingspotController');
var category_controller = require('../controllers/categoryController');

/// report ROUTES ///

// GET administration home page.
router.get('/', report_contorller.index);

// GET request for creating a report. NOTE This must come before routes that display report (uses id).
router.get('/report/create', report_contorller.report_create_get);

// POST request for creating report.
router.post('/report/create', report_contorller.report_create_post);

// GET request to delete report.
router.get('/report/:id/delete', report_contorller.report_delete_get);

// POST request to delete report.
router.post('/report/:id/delete', report_contorller.report_delete_post);

// GET request to update report.
router.get('/report/:id/update', report_contorller.report_update_get);

// POST request to update report.
router.post('/report/:id/update', report_contorller.report_update_post);

// GET request for one report.
router.get('/report/:id', report_contorller.report_detail);

// GET request for list of all report.
router.get('/reports', report_contorller.report_list);

/// AUTHOR ROUTES ///

// GET request for creating Bathingspot. NOTE This must come before route for id (i.e. display bathingspot).
router.get('/bathingspot/create', bathingspot_controller.bathingspot_create_get);

// POST request for creating Bathingspot.
router.post('/bathingspot/create', bathingspot_controller.bathingspot_create_post);

// GET request to delete Bathingspot.
router.get('/bathingspot/:id/delete', bathingspot_controller.bathingspot_delete_get);

// POST request to delete Bathingspot.
router.post('/bathingspot/:id/delete', bathingspot_controller.bathingspot_delete_post);

// GET request to update Bathingspot.
router.get('/bathingspot/:id/update', bathingspot_controller.bathingspot_update_get);

// POST request to update Bathingspot.
router.post('/bathingspot/:id/update', bathingspot_controller.bathingspot_update_post);

// GET request for one Bathingspot.
router.get('/bathingspot/:id', bathingspot_controller.bathingspot_detail);

// GET request for list of all Bathingspots.
router.get('/bathingspots', bathingspot_controller.bathingspot_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/category/create', category_controller.category_create_get);

//POST request for creating Genre.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete Genre.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete Genre.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update Genre.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update Genre.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one Genre.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all Genre.
router.get('/categories', category_controller.category_list);

module.exports = router;