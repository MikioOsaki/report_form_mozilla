const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Report = require('../models/report');
var async = require('async');
var Category = require('../models/category');

// Display list of all Genre.
exports.category_list = function (req, res) {

    Category.find({}, 'name')
        .sort([['name', 'ascending']])
        .exec(function (err, category_list) {
            if (err) { return next(err); }
            res.render('category_list', { title: 'Liste der Kategorien', category_list: category_list });
        });
};

// Display detail page for a specific Genre.
exports.category_detail = function (req, res, next) {

    async.parallel({
        category: function (callback) {
            Category.findById(req.params.id)
                .exec(callback);
        },

        category_reports: function (callback) {
            Report.find({ 'category': req.params.id })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.category == null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_reports: results.category_reports });
    });

};

// Display Genre create form on GET.
exports.category_create_get = function (req, res, next) {
    res.render('category_form', { title: 'Neue Kategorie hinzufügen' });
};

// Handle Genre create on POST.
exports.category_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Category name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var category = new Category(
            { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('category_form', { title: 'Neue Kategorie hinzufügen', category: category, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Category.findOne({ 'name': req.body.name })
                .exec(function (err, found_category) {
                    if (err) { return next(err); }

                    if (found_category) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_category.url);
                    }
                    else {

                        category.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to category detail page.
                            res.redirect(category.url);
                        });

                    }

                });
        }
    }
];

// Display Genre delete form on GET.
exports.category_delete_get = function (req, res, next) {

    async.parallel({
        category: function (callback) {
            Category.findById(req.params.id).exec(callback);
        },
        category_reports: function (callback) {
            Report.find({ 'category': req.params.id }).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.category == null) { // No results.
            res.redirect('/administration/categories');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_reports: results.category_reports });
    });

};

// Handle Genre delete on POST.
exports.category_delete_post = function (req, res, next) {

    async.parallel({
        category: function (callback) {
            Category.findById(req.params.id).exec(callback);
        },
        category_reports: function (callback) {
            Report.find({ 'category': req.params.id }).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.category_reports.length > 0) {
            // Genre has reports. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_reports: results.category_reports });
            return;
        }
        else {
            // Genre has no reports. Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to categories list.
                res.redirect('/administration/categories');
            });

        }
    });

};

// Display Genre update form on GET.
exports.category_update_get = function (req, res, next) {

    Category.findById(req.params.id, function (err, category) {
        if (err) { return next(err); }
        if (category == null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('category_form', { title: 'Kategorie bearbeiten', category: category });
    });

};

// Handle Genre update on POST.
exports.category_update_post = [

    // Validate that the name field is not empty.
    body('name', 'Category name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data (and the old id!)
        var category = new Category(
            {
                name: req.body.name,
                _id: req.params.id
            }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('category_form', { title: 'Kategorie bearbeiten', category: category, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
                if (err) { return next(err); }
                // Successful - redirect to category detail page.
                res.redirect(thecategory.url);
            });
        }
    }
];