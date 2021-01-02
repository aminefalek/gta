const mongoose = require('mongoose')
const Schema = mongoose.Schema

const scriptSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    }
})

const Script = mongoose.model('Script', scriptSchema)

module.exports = Script