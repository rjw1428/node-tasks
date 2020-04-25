const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// CREATE TASK ENDPOINT
router.post('/tasks', auth, (req, resp) =>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    task.save()
    .then(()=>{
        resp.status(201).send({status: "New Task Received", task})
    })
    .catch((e)=>{
        resp.status(400).send("Something went wrong\n"+e.message)
    })
})

// GET TASKS ENPOINT
router.get('/tasks', auth, async (req, resp) =>{
    const match = {}
    if (req.query.isComplete) {
        match.isComplete = req.query.isComplete.toLowerCase() === 'true'?true:false
    }

    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1].toLowerCase() === "desc"?-1:1
    }
    const options = {
        limit: req.query.limit?+req.query.limit:10,
        skip: req.query.skip?+req.query.skip:0,
        sort
    }

    try {
        await req.user.populate({
            path: 'taskList',
            match,
            options
        }).execPopulate()
        resp.send(req.user.taskList)
    }
    catch(e) {
        resp.status(500).send()
    }
})

// GET TASKS BY ID
router.get('/tasks/:id', async (req, resp) =>{
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id})
        if (!task) return resp.status(404).send()
        resp.send(task)
    } catch (e) {
        resp.status(500).send()
    }
})

// UPDATE TASKS BY ID
router.patch('/tasks/:id', auth, async (req, resp) =>{
    const updates = Object.keys(req.body)
    const allowedParams = Object.keys(Task.schema.paths)
    const isValid = updates.every(update=>allowedParams.includes(update))
    if (!isValid) return resp.status(400).send("Some paramaters are not valid")

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) return resp.status(404).send()
        updates.forEach(key=>task[key] = req.body[key])
        await task.save()
        return resp.send({status:"Task Updated", task})
    } catch (e) {
        console.log(e)
        resp.status(500).send()
    }
})

//REMOVE TASK BY ID
router.delete('/tasks/:id', auth, async (req, resp) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task && task.owner != req.user._id) return resp.status(401).send()
        if (!task) return resp.send("Task already removed")
        task.remove()
        const result = await Task.countDocuments({isComplete: false, owner: req.user._id})
        resp.send("Remaining Active Tasks: "+result)
    } catch(e) {
        resp.status(500).send()
    }
})

module.exports = router