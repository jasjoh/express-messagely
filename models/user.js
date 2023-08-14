"use strict";

/** User of the site. */

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

/**
 * Database Schema
 * - username - text - not nullable - primary key
 * -- FK reference from messages.from_username
 * -- FK reference from messages.to_username
 * - password - text - not nullable
 * - first_name - text - not nullable
 * - last_name - text - not nullable
 * - phone - text - not nullable
 * - join_at - ts + tz - not nullable
 * - last_login_at - ts + tz - nullable
 */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(
      password,
      BCRYPT_WORK_FACTOR
      );

      const result = await db.query(
      `INSERT INTO users (
          username,
          password,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at
          )
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    // pull password out of DB for username
    const result = await db.query(
      `SELECT password
        FROM users
        WHERE username = $1`, [username]
    );
    const user = result.rows[0];

    // throw NotFound is record doesn't exist
    // TODO: In this case, we should not return not-found / username.
    // TODO: And the error should ultimately be a 401
    // TODO: We can just return false from this function and let route handle
    if (!user) throw new NotFoundError(`No such user: ${username}`);

    // do bcrypt password validation and return result
    return await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1
        RETURNING username`, [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
        FROM users`
    );

    return result.rows;

  }

  // TODO: Ideally calls out unknown user throws NotFoundError
  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`, [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    //throws exception if user is not found
    await User.get(username);

    // TODO: Don't need the f join (can use from_username)
    const result = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              t.username as "toUsername",
              t.first_name as "toFirstName",
              t.last_name as "toLastName",
              t.phone as "toPhone"
        FROM messages as m
        JOIN users as f ON m.from_username = f.username
        JOIN users as t ON m.to_username = t.username
        WHERE f.username = $1`, [username]
    );
    const messages = result.rows;

    // TODO: Ideally var name isn't so generic
    const response = messages.map(message => {
      // console.log("message in messages:", message);
      return {
        id: message.id,
        to_user: {
          username: message.toUsername,
          first_name: message.toFirstName,
          last_name: message.toLastName,
          phone: message.toPhone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      };
    });

    return response;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    //throws exception if user is not found
    await User.get(username);

    const result = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              f.username as "fromUsername",
              f.first_name as "fromFirstName",
              f.last_name as "fromLastName",
              f.phone as "fromPhone"
        FROM messages as m
        JOIN users as t ON m.to_username = t.username
        JOIN users as f ON m.from_username = f.username
        WHERE t.username = $1`, [username]
    );
    const messages = result.rows;

    const response = messages.map(message => {
      return {
        id: message.id,
        from_user: {
          username: message.fromUsername,
          first_name: message.fromFirstName,
          last_name: message.fromLastName,
          phone: message.fromPhone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      };
    });

    return response;
  }
}


module.exports = User;
