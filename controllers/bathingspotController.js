const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Report = require('../models/report');
var async = require('async');
var Bathingspot = require('../models/bathingspot');

// Display list of all Category.
exports.bathingspot_list = function (req, res) {

    Bathingspot.find({}, 'name')
        .sort([['name', 'ascending']])
        .exec(function (err, bathingspot_list) {
            if (err) { return next(err); }
            res.render('bathingspot_list', { title: 'Bathingspot List', bathingspot_list: bathingspot_list });
        });
};

// Display detail page for a specific Category.
exports.bathingspot_detail = function (req, res, next) {

    async.parallel({
        bathingspot: function (callback) {
            Bathingspot.findById(req.params.id)
                .exec(callback);
        },

        bathingspot_reports: function (callback) {
            Report.find({ 'bathingspot': req.params.id })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.bathingspot == null) { // No results.
            var err = new Error('Bathingspot not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('bathingspot_detail', { title: 'Bathingspot Detail', bathingspot: results.bathingspot, bathingspot_reports: results.bathingspot_reports });
    });

};

// Display Category create form on GET.
exports.bathingspot_create_get = function (req, res, next) {
    res.render('bathingspot_form', { title: 'Create Bathingspot' });
};

// Handle Category create on POST.
exports.bathingspot_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Bathingspot name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var bathingspot = new Bathingspot(
            { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('bathingspot_form', { title: 'Bathingspot Category', bathingspot: bathingspot, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Category with same name already exists.
            Bathingspot.findOne({ 'name': req.body.name })
                .exec(function (err, found_bathingspot) {
                    if (err) { return next(err); }

                    if (found_bathingspot) {
                        // Category exists, redirect to its detail page.
                        res.redirect(found_bathingspot.url);
                    }
                    else {

                        bathingspot.save(function (err) {
                            if (err) { return next(err); }
                            // Category saved. Redirect to category detail page.
                            res.redirect(bathingspot.url);
                        });

                    }

                });
        }
    }
];

// Display Bathingspot delete form on GET.
exports.bathingspot_delete_get = function (req, res, next) {

    async.parallel({
        bathingspot: function (callback) {
            Bathingspot.findById(req.params.id).exec(callback)
        },
        bathingspots_reports: function (callback) {
            Report.find({ 'bathingspot': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.bathingspot == null) { // No results.
            res.redirect('/administration/bathingspots');
        }
        // Successful, so render.
        res.render('bathingspot_delete', { title: 'Delete Bathingspot', bathingspot: results.bathingspot, bathingspot_reports: results.bathingspots_reports });
    });

};

// Handle Bathingspot delete on POST.
exports.bathingspot_delete_post = function (req, res, next) {

    async.parallel({
        bathingspot: function (callback) {
            Bathingspot.findById(req.body.bathingspotid).exec(callback)
        },
        bathingspots_reports: function (callback) {
            Report.find({ 'bathingspot': req.body.bathingspotid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.bathingspots_reports.length > 0) {
            // Bathingspot has reports. Render in same way as for GET route.
            res.render('bathingspot_delete', { title: 'Delete Bathingspot', bathingspot: results.bathingspot, bathingspot_reports: results.bathingspots_reports });
            return;
        }
        else {
            // Bathingspot has no reports. Delete object and redirect to the list of bathingspots.
            Bathingspot.findByIdAndRemove(req.body.bathingspotid, function deleteBathingspot(err) {
                if (err) { return next(err); }
                // Success - go to bathingspot list.
                res.redirect('/administration/bathingspots')
            })

        }
    });

};

// Display Bathingspot update form on GET.
exports.bathingspot_update_get = function (req, res, next) {

    Bathingspot.findById(req.params.id, function (err, bathingspot) {
        if (err) { return next(err); }
        if (bathingspot == null) { // No results.
            var err = new Error('Bathingspot not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('bathingspot_form', { title: 'Update Bathingspot', bathingspot: bathingspot });

    });
};

// Handle Bathingspot update on POST.
exports.bathingspot_update_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Bathingspot object with escaped and trimmed data (and the old id!)
        var bathingspot = new Bathingspot(
            {
                name: req.body.name,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('bathingspot_form', { title: 'Update Bathingspot', bathingspot: bathingspot, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Bathingspot.findByIdAndUpdate(req.params.id, bathingspot, {}, function (err, thebathingspot) {
                if (err) { return next(err); }
                // Successful - redirect to category detail page.
                res.redirect(thebathingspot.url);
            });
        }
    }
];
