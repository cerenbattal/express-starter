const express = require('express')
const { specs, swaggerUi } = require('./config/swagger');
var path = require('path')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const port = 3000
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
app.use(express.json())
app.use(express.static('public'))

app.use("/users", userRoute);
app.use("/auth", authRoute);

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected')
})

const publicFolder = path.join(__dirname, 'public')

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/home', (req, res) => {
  res.sendFile(path.join(publicFolder, 'index.html'))
})

app.post('/hi', (req, res) => {
  res.send({
    text: `hi ${req.body.name}`,
  })
})

app.get('/sample-query', (req, res) => {
  res.send({
    text: `hi ${req.query.a}`,
  })
})
