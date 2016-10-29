// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var postSchema = new Schema({
    title: String,
    description: String,
    image: String,
    image_id: String,
    created_at: Date
});

var Post = mongoose.model('Post', postSchema);

// make this available to our users in our Node applications
module.exports = Post;