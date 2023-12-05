const mongoose = require("mongoose");

const appointment = new mongoose.Schema({
    orner: String,
    name: String,
    email: String,
    description: String,
    date: Date,
    time: String,
    link:String,
    finished: Boolean,
    notified: Boolean
});

module.exports = appointment;