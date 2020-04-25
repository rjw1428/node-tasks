const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user-routes')
const taskRouter = require('./routers/task-routes')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// START APP
app.listen(port, () =>{
    console.log(`Server has started on port ${port}`)
})