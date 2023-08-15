"use strict";

const Router = require("express").Router;
const router = new Router();
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;

  const authenticated = await User.authenticate(username, password);

  // TODO: Should reverse the order here (fail case first)
  if (authenticated === true) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid credentials");

});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const {
    username,
    password,
    first_name,
    last_name,
    phone
  } = req.body;

  const user = await User.register({
    username,
    password,
    first_name,
    last_name,
    phone
  });

  const token = jwt.sign({ user.username }, SECRET_KEY);

  return res.json({ token });
});


module.exports = router;