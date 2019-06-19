var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const dbRoute = 'mongodb://localhost/elad';

mongoose.connect(
    dbRoute,
    {useNewUrlParser: true}
);

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileImage: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
    var query = {username: username};
    console.log("The query is: " + query);
    User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    console.log("candidatePassword is " + candidatePassword);
    console.log("hash is " + hash);
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        callback(null, isMatch);
    });
}

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            console.log("generate hash is " + hash);
            console.log("salt is " + salt);
            newUser.save(callback);
        });
    });
}
