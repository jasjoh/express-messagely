"use strict";

/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromRequest = req.query._token || req.body._token;
    const payload = jwt.verify(tokenFromRequest, SECRET_KEY);
    res.locals.user = payload;
    return next();
  } catch (err) {
    // error in this middleware isn't error -- continue on
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) throw new UnauthorizedError();

  return next();
}

/** Middleware: Requires user is user for route. */

function ensureCorrectUser(req, res, next) {
  const currentUser = res.locals.user;
  const hasUnauthorizedUsername = currentUser?.username !== req.params.username;

if (!currentUser || hasUnauthorizedUsername){
  throw new UnauthorizedError();
}

  return next();
}

/** Middleware: Requires user to be recipient or sender of message to access. */

function


/** Middleware: Requires user to be recipient of message to access. */


//req.params.id && res.locals.user => could call a function within auth that passes
// if auth function receives False, throw error. otherwise, next.
//models --> current user associated with message id/sender
// models --> is current user recipient of message id


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
};
