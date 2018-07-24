var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ReportSchema = new Schema(
  {
    //_someId: Schema.Types.ObjectId,
    bathingspot: { type: Schema.ObjectId, ref: 'Bathingspot', required: true },
    category: [{ type: Schema.ObjectId, ref: 'Category', required: true }],
    subject: { type: String, required: true },
    description: { type: String, required: true },
    //location
    //photo array ofBuffer: [Buffer],
    //lastname
    //firstname
    //mail
    //phone: {type: String, required: false}
    //date: { type: Date, default: Date.now } //hidden! not a input. 
  });

// Virtual for this report instance URL.
// Virtuals are document properties that you can get and set but that do not get persisted to MongoDB!
// Example Mongoose doc virtual for fullname Axl Rose
ReportSchema
  .virtual('url')
  .get(function () {
    return '/administration/report/' + this._id;
  });

//Export model
module.exports = mongoose.model('Report', ReportSchema);