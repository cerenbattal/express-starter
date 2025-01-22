const express = require("express");
const Users = require("../model/User");

const router = express.Router();

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Retrieves all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved all users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the user.
 *                   name:
 *                     type: string
 *                     description: The name of the user.
 *                   email:
 *                     type: string
 *                     description: The email of the user.
 *                   age:
 *                     type: integer
 *                     description: The age of the user.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
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

/**
 * @swagger
 * /users/:
 *   post:
 *     summary: Creates a new user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new user.
 *               email:
 *                 type: string
 *                 description: The email of the new user.
 *               age:
 *                 type: integer
 *                 description: The age of the new user.
 *     responses:
 *       201:
 *         description: Successfully created a new user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the new user.
 *                 name:
 *                   type: string
 *                   description: The name of the new user.
 *                 email:
 *                   type: string
 *                   description: The email of the new user.
 *                 age:
 *                   type: integer
 *                   description: The age of the new user.
 *       400:
 *         description: Bad request - Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
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

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deletes a user by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User has been deleted.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
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

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieves a user by their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the user.
 *                 name:
 *                   type: string
 *                   description: The name of the user.
 *                 email:
 *                   type: string
 *                   description: The email address of the user.
 *                 age:
 *                   type: integer
 *                   description: The age of the user.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
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

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Replaces user information by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the user.
 *               email:
 *                 type: string
 *                 description: The new email address of the user.
 *               age:
 *                 type: integer
 *                 description: The new age of the user.
 *     responses:
 *       200:
 *         description: User information successfully replaced.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User has been updated.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
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

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Updates user information by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the user.
 *               email:
 *                 type: string
 *                 description: Updated email address of the user.
 *               password:
 *                 type: string
 *                 description: Updated password of the user.
 *               age:
 *                 type: integer
 *                 description: Updated age of the user.
 *     responses:
 *       200:
 *         description: User information successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User has been updated.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
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