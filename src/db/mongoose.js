const mongoose = require('mongoose')
const connectionURL = "mongodb://127.0.0.1:27017"
const dbName = 'task-manager2'

mongoose.connect(connectionURL+"/"+dbName, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})