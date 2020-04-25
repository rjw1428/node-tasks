const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user-routes')
const taskRouter = require('./routers/task-routes')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app