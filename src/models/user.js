const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) 
                throw new Error('Age Must Be Positive')
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) 
                throw new Error('Email is invalid')
        }
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) 
                throw new Error("C'mon man, make the password a little harder than that")
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }   
    }],
    avatarImage: {
        type: Buffer
    }
}, {
    timestamps: true
})


//VIRTUAL PROPERTIES
userSchema.virtual('taskList', {
    ref: "Task",
    localField: '_id',
    foreignField: 'owner'
})

//INSTANCE METHODS (SINGLE INSTANCE ONLY)
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({_id: this._id.toString()}, 'thisIsASecret1428')
    this.tokens = this.tokens.concat({token})
    this.save()
    return token
}

userSchema.methods.toJSON = function() {
    const userObj = this.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatarImage
    return userObj
}

// STATIC METHODS (CLASSWIDE)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) throw new Error("Email does not exist")
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new Error("Unable to log in")

    return user
}

// Hash Password
userSchema.pre('save', async function(next) {
    if (this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 8)
    next()
})

// Remove All tasks when user is deleted
userSchema.pre('remove', async function(next) {
    await Task.deleteMany({owner: this._id})
    next()
})


const User = mongoose.model('Users', userSchema)

module.exports = User