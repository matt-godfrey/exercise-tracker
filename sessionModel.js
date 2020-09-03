var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionSchema = new Schema({
    // userId: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: String
//    date: { type: Date, default: new Date() }
})

module.exports = mongoose.model('Session', sessionSchema)
