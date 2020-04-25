const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userZero, userOne, taskZero, taskOne, taskTwo, setupDB} = require('./fixtures/db')

beforeEach(setupDB)

test("Should create task for user", async () => {
    const resp = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
        .send({
            "name": "Fuck All",
            "description": "some shit"
        })
        .expect(201)

    const task = await Task.findById(resp.body.task._id)
    expect(task).not.toBeNull()
    expect(task.isComplete).toEqual(false)
    expect(task.owner).toEqual(userZero._id)
})

test("User One should start with two tasks", async () => {
    const resp = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(resp.body.length).toBe(2)
})

test("User one should not be able to delete user two tasks", async () => {
    const resp = await request(app)
        .delete('/tasks/'+taskZero._id)
        .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
        .send()
        .expect(500)
})

test("User should be able to delete there own tasks", async () => {
    const resp = await request(app)
        .delete('/tasks/'+taskZero._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})