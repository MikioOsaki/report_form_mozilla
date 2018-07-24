var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BathingspotSchema = new Schema({
    name: { type: String, required: true, max: 100 }
});

// Virtual for this bathingspot instance URL.
BathingspotSchema
    .virtual('url')
    .get(function () {
        return '/administration/bathingspot/' + this._id;
    });

// Export model.
module.exports = mongoose.model('Bathingspot', BathingspotSchema);