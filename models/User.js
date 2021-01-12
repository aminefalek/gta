const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
	},
	guser: {
		type: Boolean,
		default: false
	}
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User