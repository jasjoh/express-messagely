"use strict";

const Router = require("express").Router;
const router = new Router();

const {
  ensureLoggedIn,
  ensureAssociatedUser,
  ensureRecipient
} = require("../middleware/auth");

const Message = require("../models/message");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureAssociatedUser, async function (req, res, next) {
  const message = await Message.get(req.params.id);
  return res.json({ message });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  // Message.create expects: { from_username, to_username, body }
  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;
  const message = await Message.create(
    { from_username, to_username, body }
  );

  return res.json({ message });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
// TODO: We could also have ensureLoggedIn middleware
router.post('/:id/read', ensureRecipient, async function (req, res, next) {
  // Message.create expects: { from_username, to_username, body }
  console.log("endpoint to read message called with id:", req.params.id);
  const message = await Message.markRead(req.params.id);
  console.log("retrieved message on read:", message);
  return res.json({ message });
});


module.exports = router;