//  Roughly, it would translate into this: const body = require("express-validator/check").body; and same for validationResult
const { body, validationResult } = require('express-validator/check'); // destruturing assignment syntax
const { sanitizeBody } = require('express-validator/filter'); // destructuring assignment syntax
var expressValidator  = require('express-validator');
var Report = require('../models/report');
var Bathingspot = require('../models/bathingspot');
var Category = require('../models/category');

var async = require('async');

exports.user_index = function (req, res) {

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
        res.render('user_index', { title: 'Berliner Badestellen Reportingsystem - Startseite', error: err, data: results });
    });
};

// Display report create form on GET.
exports.report_create_get = function (req, res, next) {

    // Get all bathingspots and categories, which we can use for adding to our report.
    // async.parallel( Object or Array - each with callback, [err, results]) 
    async.parallel({
        bathingspots: function (callback) {
            Bathingspot.find(callback);
        },
        categories: function (callback) {
            Category.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('report_form', { title: 'Report erstellen', bathingspots: results.bathingspots, categories: results.categories });
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
    body('firstname').trim(),
    body('lastname').trim(),
    body('email').trim(),
    body('phone').trim(),
    // isAlpha(['de-DE','ar-DZ']).optional({checkFalsy:true}).withMessage('Lastname must be alphabetic ').trim(),
    // geht aber lässt keine Umlaute zu und auch keine - ..göring-eckardt etc.

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
                date: req.body.date,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone
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
                    if (report.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked = 'true';
                    }
                }
                res.render('report_form', { title: 'Report erstellen', bathingspots: results.bathingspots, categories: results.categories, report: report, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save report.
            report.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new report record.
                res.render('user_success', { title: 'Erfolgreich versendet', report: report, errors: errors.array() });
                //res.redirect(report.url);
            });
        }
    }
];