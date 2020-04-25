const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userZeroId = new mongoose.Types.ObjectId()
const userZero = {
    _id: userZeroId,
    name: "Patient Zero",
    email: 'test8@test.com',
    password: "letmein123",
    tokens: [{
        token: jwt.sign({_id: userZeroId.toString()}, process.env.HASH_SECRET)
    }]
}
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Patient One",
    email: 'test2@test.com',
    password: "letmein123",
    tokens: [{
        token: jwt.sign({_id: userOneId.toString()}, process.env.HASH_SECRET)
    }]
}

const taskZero = {
    _id: new mongoose.Types.ObjectId(),
    name: "Task One",
    description: "This is the first task",
    isComplete: false,
    owner: userOneId
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    name: "Task Two",
    description: "This is the second task",
    isComplete: false,
    owner: userOneId
}


const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    name: "Task Three",
    description: "This is the third task",
    isComplete: false,
    owner: userZeroId
}

const setupDB = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userZero).save()
    await new User(userOne).save()
    await new Task(taskZero).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
}

module.exports = {
    userZero,
    userOne,
    taskOne,
    taskTwo,
    taskZero,
    setupDB
}