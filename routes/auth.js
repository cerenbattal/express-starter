const express = require("express");
const jwt = require("jsonwebtoken");
const Users = require("../model/User");
const router = express.Router();

router.use(express.json()) // TODO

// Handling post request
router.post("/login",
  async (req, res, next) => {
    let { email, password } = req.body;
    let existingUser;
    try {
      existingUser =
        await Users.findOne({ email: email });
    } catch {
      const error =
        new Error(
          "Error! Something went wrong."
        );
      return next(error);
    }
    if (!existingUser
      || existingUser.password
      !== password) {
      const error =
        Error(
          "Wrong details please check at once"
        );
      return next(error);
    }
    let token;
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.log(err);
      const error =
        new Error("Error! Something went wrong.");
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
  });

module.exports = router;