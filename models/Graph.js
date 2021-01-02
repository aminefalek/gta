const mongoose = require('mongoose')
const Schema = mongoose.Schema

const edgeSchema = new Schema({ 
    head: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    }
});

const coordinateSchema = new Schema({ 
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    }
});

const graphSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    graph: {
        type: Map,
        of: [edgeSchema],
        required: true
    },
    layout: {
        type: [coordinateSchema],
        required: true
    }
})

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph