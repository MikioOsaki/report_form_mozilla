
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Report = require('../models/report');
var Bathingspot = require('../models/bathingspot');
var Category = require('../models/category');

var async = require('async');

exports.index = function (req, res) {

    async.parallel({
        report_count: function (callback) {
            Report.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        bathingspot_count: function (callback) {
            Bathingspot.count({}, callback);
        },
        category_count: function (callback) {
            Category.count({}, callback);
        },
    }, function (err, results) {
        res.render('index', { title: 'Berliner Badestellen Reportingsystem - Home', error: err, data: results });
    });
};

// Display list of all Reports.
exports.report_list = function (req, res, next) {

    Report.find({}, 'subject bathingspot date category description')
        .populate('bathingspot')
        .exec(function (err, report_list) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('report_list', { title: 'Report List', report_list: report_list });
        });

};

// Display detail page for a specific report.
exports.report_detail = function (req, res, next) {

    async.parallel({
        report: function (callback) {

            Report.findById(req.params.id)
                .populate('bathingspot')
                .populate('category')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.report == null) { // No results.
            var err = new Error('Report not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('report_detail', { title: 'Report Detail', report: results.report });
    });

};

// Display report create form on GET.
exports.report_create_get = function (req, res, next) {

    // Get all bathingspots and categories, which we can use for adding to our report.
    async.parallel({
        bathingspots: function (callback) {
            Bathingspot.find(callback);
        },
        categories: function (callback) {
            Category.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('report_form', { title: 'Create Report', bathingspots: results.bathingspots, categories: results.categories });
    });

};

// Handle report create on POST.
exports.report_create_post = [
    // Convert the category to an array.
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
            if (typeof req.body.category === 'undefined')
                req.body.category = [];
            else
                req.body.category = new Array(req.body.category);
        }
        next();
    },

       // Validate fields.
       body('subject', 'Subject must not be empty.').isLength({ min: 1 }).trim(),
       body('bathingspot', 'Bathingspot must not be empty.').isLength({ min: 1 }).trim(),
       body('description', 'Description must not be empty.').isLength({ min: 1 }).trim(),
   
       // Sanitize fields (using wildcard).
       sanitizeBody('*').trim().escape(),
   
       // Process request after validation and sanitization.
       (req, res, next) => {
   
           // Extract the validation errors from a request.
           const errors = validationResult(req);
   
           // Create a Report object with escaped and trimmed data.
           var report = new Report(
               {
                   subject: req.body.subject,
                   bathingspot: req.body.bathingspot,
                   description: req.body.description,
                   category: req.body.category,
                   date: req.body.date

               });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all bathingspots and categories for form.
            async.parallel({
                bathingspots: function (callback) {
                    Bathingspot.find(callback);
                },
                categories: function (callback) {
                    Category.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (report.category.indexOf(results.category[i]._id) > -1) {
                        results.category[i].checked = 'true';
                    }
                }
                res.render('report_form', { title: 'Create Report', bathingspots: results.bathingspots, categories: results.categories, report: report, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save report.
            report.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new report record.
                res.redirect(report.url);
            });
        }
    }
];

// Display report delete form on GET.
exports.report_delete_get = function (req, res, next) {

    async.parallel({
        report: function (callback) {
            Report.findById(req.params.id).populate('bathingspot').populate('category').exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.report == null) { // No results.
            res.redirect('/administration/reports');
        }
        // Successful, so render.
        res.render('report_delete', { title: 'Delete Report', report: results.report });
    });

};

// Handle report delete on POST.
exports.report_delete_post = function (req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        report: function (callback) {
            Report.findById(req.params.id).populate('bathingspot').populate('category').exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }

        // Report has no ReportInstance objects. Delete object and redirect to the list of reports.
        Report.findByIdAndRemove(req.body.id, function deleteReport(err) {
            if (err) { return next(err); }
            // Success - got to reports list.
            res.redirect('/administration/reports');
        });

    });

};

// Display report update form on GET.
exports.report_update_get = function (req, res, next) {

    // Get report, bathingspots and categories for form.
    async.parallel({
        report: function (callback) {
            Report.findById(req.params.id).populate('bathingspot').populate('category').exec(callback);
        },
        bathingspots: function (callback) {
            Bathingspot.find(callback);
        },
        categories: function (callback) {
            Category.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.report == null) { // No results.
            var err = new Error('Report not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected categories as checked.
        for (var all_g_iter = 0; all_g_iter < results.categories.length; all_g_iter++) {
            for (var report_g_iter = 0; report_g_iter < results.report.category.length; report_g_iter++) {
                if (results.category[all_g_iter]._id.toString() == results.report.category[report_g_iter]._id.toString()) {
                    results.category[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('report_form', { title: 'Update Report', bathingspots: results.bathingspots, categories: results.categories, report: results.report });
    });

};


// Handle report update on POST.
exports.report_update_post = [

    // Convert the category to an array.
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
            if (typeof req.body.category === 'undefined')
                req.body.category = [];
            else
                req.body.category = new Array(req.body.category);
        }
        next();
    },

    // Validate fields.
    body('subject', 'Subject must not be empty.').isLength({ min: 1 }).trim(),
    body('bathingspot', 'Bathingspot must not be empty.').isLength({ min: 1 }).trim(),
    body('description', 'Description must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('subject').trim().escape(),
    sanitizeBody('bathingspot').trim().escape(),
    sanitizeBody('description').trim().escape(),
    sanitizeBody('category.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Report object with escaped/trimmed data and old id.
        var report = new Report(
            {
                subject: req.body.subject,
                bathingspot: req.body.bathingspot,
                description: req.body.description,
                category: (typeof req.body.category === 'undefined') ? [] : req.body.category,
                _id: req.params.id // This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all bathingspots and categories for form
            async.parallel({
                bathingspots: function (callback) {
                    Bathingspot.find(callback);
                },
                categories: function (callback) {
                    Category.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (report.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked = 'true';
                    }
                }
                res.render('report_form', { title: 'Update Report', bathingspots: results.bathingspots, categories: results.categories, report: report, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Report.findByIdAndUpdate(req.params.id, report, {}, function (err, thereport) {
                if (err) { return next(err); }
                // Successful - redirect to report detail page.
                res.redirect(thereport.url);
            });
        }
    }
];