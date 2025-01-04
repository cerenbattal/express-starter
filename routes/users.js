const express = require("express");
const Users = require("../model/User");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await Users.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

router.post('/', async (req, res) => {
  const user = new Users({
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

router.delete('/:id', async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id)
    res.json({
      message: 'User has been deleted.',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id)
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

router.put('/:id', async (req, res) => {
  try {
    await Users.findByIdAndUpdate(req.params.id, {
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

router.patch('/:id', async (req, res) => {
  try {
    console.log(req.body)
    await Users.findByIdAndUpdate(req.params.id, req.body)

    await res.json({
      message: 'User has been updated',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

module.exports = router;