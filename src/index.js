const app = require('./app')
const port = process.env.PORT

// START APP
app.listen(port, () =>{
    console.log(`Server has started on port ${port}`)
})