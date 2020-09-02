var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    Session = require('./sessionModel.js'),
    sessionSchema = mongoose.model('Session').schema

var userSchema = new Schema({
    // _id: { type: String, required: true },
    username: { type: String, required: true },
    log: [sessionSchema]
    
    
})

module.exports = mongoose.model('User', userSchema)