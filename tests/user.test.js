const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const sgMail = require('@sendgrid/mail')
const {userZero, setupDB} = require('./fixtures/db')

beforeEach(setupDB)

test("Should signup a new user", async ()=>{
    const resp = await request(app).post('/users').send({
        name: "Ryan",
        email: 'rjw1428@gmail.com',
        password: "letmein123"
    })
    .expect(201)
    const user = await User.findById(resp.body._id)

    //Mock Email Test
    sgMail.send()

    expect(user).not.toBeNull()
})

test("Should not allow duplicate emails", async ()=>{
    await request(app).post('/users').send(userZero)
    .expect(400)
})

test("Should login existing user", async () => {
    const resp = await request(app).post('/users/login').send({
        email: userZero.email,
        password: userZero.password
    })
    .expect(200)
    const user = await User.findById(userZero._id)
    expect(resp.body.token).toBe(user.tokens[1].token)
})

test("Should block wrong password", async () => {
    await request(app).post('/users/login').send({
        email: userZero.email,
        password: "wrongpassword"
    })
    .expect(400)
})

test("Should block non-existing user", async () => {
    await request(app).post('/users/login').send({
        email: "nothere@bullshit.com",
        password: userZero.password
    })
    .expect(400)
})

test("Should get user profile", async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not get unauthorized profile", async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userZero.tokens[0].token+"SHIT"}`)
        .send()
        .expect(401)
})

test("Should not delete unauthorized user", async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test("Should delete authorized user", async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
        .send()
        .expect(200)

        const user = await User.findById(userZero._id)
        expect(user).toBeNull()
})

test('Should Upload Image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userZero._id)
    expect(user.avatarImage).toEqual(expect.any(Buffer))
})

test('Should update user field', async () => {
    let newName = "New Patient Zero"
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
        .send({
            name: newName
        })
        .expect(200)

    const user = await User.findById(userZero._id)
    expect(user.name).toBe(newName)
})

test('Should not update user field if unauthorized', async () => {
    let newName = "New Patient Zero"
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userZero.tokens[0].token+"POOP"}`)
        .send({
            name: newName
        })
        .expect(401)

    const user = await User.findById(userZero._id)
    expect(user.name).toBe(userZero.name)
})