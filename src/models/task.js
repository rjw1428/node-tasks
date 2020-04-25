const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Users'
    }
}, {
    timestamps: true
})

taskSchema.pre('save', async function(next) {
    next()
})


const Task = mongoose.model('Task',taskSchema)

module.exports = Task
