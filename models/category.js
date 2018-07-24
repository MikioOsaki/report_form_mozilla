var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: { type: String, required: true, max: 100 }
});

// Virtual for this category instance URL.
CategorySchema
    .virtual('url')
    .get(function () {
        return '/administration/category/' + this._id;
    });

// Export model.
module.exports = mongoose.model('Category', CategorySchema);