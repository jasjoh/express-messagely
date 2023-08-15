"use strict";

/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

const Message = require("../models/message");


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

async function ensureAssociatedUser(req, res, next) {
  const currentUser = res.locals.user?.username;
  const isAssociated = await Message.isUserAuthor(req.params.id, currentUser)
    || await Message.isUserRecipient(req.params.id, currentUser);

  // this is only true if either message returns literal 'true'
  if (isAssociated !== true){
    throw new UnauthorizedError();
  }

  return next();
}


/** Middleware: Requires user to be recipient of message to access. */

async function ensureRecipient(req, res, next) {
  const currentUser = res.locals.user?.username;
  const isRecipient = await Message.isUserRecipient(req.params.id, currentUser);

  // this is only true if either message returns literal 'true'
  if (isRecipient !== true){
    throw new UnauthorizedError();
  }

  return next();
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAssociatedUser,
  ensureRecipient
};
