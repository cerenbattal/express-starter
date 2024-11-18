const express = require('express')
var path = require('path')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const port = 3000

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected')
})

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
})
const User = mongoose.model('User', userSchema)

app.use(express.json())
app.use(express.static('public'))

var public = path.join(__dirname, 'public')

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/home', (req, res) => {
  res.sendFile(path.join(public, 'index.html'))
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

app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

app.post('/user', async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
  })

  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
})

app.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    res.json({
      message: 'User has been deleted.',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (user === null) {
      res.status(404).json({
        message: 'User not found',
      })
    } else {
      res.json(user)
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

app.put('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
    })
    res.json({
      message: 'User has been updated',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

app.patch('/user/:id', async (req, res) => {
  try {
    console.log(req.body)
    await User.findByIdAndUpdate(req.params.id, req.body)

    await res.json({
      message: 'User has been updated',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})
