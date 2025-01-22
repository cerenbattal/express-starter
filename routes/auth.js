const express = require("express");
const cookieparser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const Users = require("../model/User");
const router = express.Router();

router.use(cookieparser());

const findUser = async (email) => {
  try {
    return Users.findOne({ email: email });
  } catch {
    return new Error(
      "Error! User cannot found."
    );
  }
}

// Handling post request
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *     security: []  # This route does not require bearer authentication
*/
router.post("/login",
  async (req, res, next) => {
    let { email, password } = req.body;
    const existingUser = await findUser(email);

    if (existingUser instanceof Error) {
      return next(existingUser);
    } else {
      if (!existingUser) {
        const error = Error("No user exists!");
        return next(error);
      }
      if (existingUser.password !== password) {
        const error = Error("Please check your credentials.");
        return next(error);
      }

      let token;
      try {
        //Creating jwt token
        token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email
          },
          process.env.ACCESS_SECRET_KEY,
          { expiresIn: "3m" }
        );

        const refreshToken = jwt.sign({
          userId: existingUser.id,
          email: existingUser.email
        }, process.env.REFRESH_SECRET_KEY, { expiresIn: '1d' });

        // Assigning refresh token in http-only cookie
        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          sameSite: 'None', secure: true,
          maxAge: 24 * 60 * 60 * 1000
        });
      } catch (err) {
        const error = new Error("Cannot initialize token!");
        return next(error);
      }

      res
        .status(200)
        .json({
          success: true,
          data: {
            userId: existingUser.id,
            email: existingUser.email,
            token: token,
          },
        });
    }
  });

// Handling post request
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Creates a new user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               age:
 *                 type: integer
 *                 description: The age of the user.
 *     responses:
 *       201:
 *         description: Successfully created a new user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: The ID of the newly created user.
 *                     email:
 *                       type: string
 *                       description: The email of the newly created user.
 *                     token:
 *                       type: string
 *                       description: A JWT token assigned to the user.
 *       409:
 *         description: Conflict - User already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       description: Error message indicating the user already exists.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       description: Error message indicating a server issue.
 */
router.post("/signup",
  async (req, res, next) => {
    const {
      name,
      email,
      password,
      age
    } = req.body;

    const existingUser = await findUser(email);

    if (existingUser instanceof Error) {
      return next(existingUser);
    }

    if (existingUser) {
      const error = new Error("Error! The user already exists");
      res
        .status(409)
        .json({
          success: false,
          data: {
            error: error.message,
          },
        });
    } else {
      const newUser =
        Users({
          name,
          email,
          password,
          age
        });

      try {
        await newUser.save();
      } catch {
        const error = new Error("Error! Something went wrong while creating the new user.");
        res
          .status(500)
          .json({
            success: false,
            data: {
              error: error.message,
            },
          });
      }

      let token;
      try {
        token = jwt.sign({
            userId: newUser.id,
            email: newUser.email
          },
          process.env.ACCESS_SECRET_KEY,
          { expiresIn: "3m" }
        );
      } catch (err) {
        const error = new Error("Error! Something went wrong.");
        res
          .status(500)
          .json({
            success: false,
            data: {
              error: error.message,
            },
          });
      }

      res
        .status(201)
        .json({
          success: true,
          data: {
            userId: newUser.id,
            email: newUser.email,
            token: token
          },
        });
    }
  });

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Generates a new access token using a refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jwt:
 *                 type: string
 *                 description: The refresh token provided in the cookies.
 *     responses:
 *       200:
 *         description: Successfully generated a new access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The newly generated access token.
 *       406:
 *         description: Unauthorized - Invalid or missing refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating unauthorized access.
 */
router.post('/refresh', (req, res) => {
  if (req.cookies?.jwt) {

    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.jwt;
    // Verifying refresh token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          // Wrong Refresh Token
          return res.status(406).json({ message: 'Unauthorized' });
        } else {
          // Correct token we send a new access token
          const userInfo = jwt.decode(refreshToken);
          const accessToken = jwt.sign({
            userId: userInfo.userId,
            email: userInfo.email
          }, process.env.ACCESS_SECRET_KEY, {
            expiresIn: '10m'
          });
          return res.json({ accessToken });
        }
      })
  } else {
    return res.status(406).json({ message: 'Unauthorized' });
  }
})


// TODO: password encode/decode!!

module.exports = router;