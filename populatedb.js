#! /usr/bin/env node

console.log('This script populates some test reports, bathingspots and categories to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Bathingspot = require('./models/bathingspot')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var bathingspots = []
var categories = []

function bathingspotCreate(name, cb) {
  bathingspotdetail = {name:name}

  var bathingspot = new Bathingspot(bathingspotdetail);
       
  bathingspot.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Bathingspot: ' + bathingspot);
    bathingspots.push(bathingspot)
    cb(null, bathingspot)
  }  );
}

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function createCategoryBathingspots(cb) {
    async.parallel([
        function(callback) {
          bathingspotCreate('Orankesee');
        },
        
        function(callback) {
          categoryCreate("Infrastruktur", callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createCategoryBathingspots,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
