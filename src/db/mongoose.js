const mongoose = require('mongoose')
const connectionURL = process.env.DB_URL
const dbName = process.eventNames.DB_COLLECTION

mongoose.connect(connectionURL+"/"+dbName, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})