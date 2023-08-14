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
      password, BCRYPT_WORK_FACTOR);
    const user = await db.query(
      `INSERT INTO users (
        username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp)
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
    // throw NotFound is record doesn't exist
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    // do bcrypt password validation and return result
    return await bcrypt.compare(password, user.password)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
