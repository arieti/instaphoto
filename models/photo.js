// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var photoSchema = new Schema({
    user: String,
    description: String,
    image: String,
    likes: {type: Number, default: 0},
    created_at: Date
});

var Photo = mongoose.model('Photo', photoSchema);

// make this available to our users in our Node applications
module.exports = Photo;