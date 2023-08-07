const mongoose = require("mongoose")

const Course = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    file: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})


module.exports = mongoose.model('Course', Course)