"use strict";

/** Message class for message.ly */

const { NotFoundError } = require("../expressError");
const db = require("../db");

/** Message on the site. */

class Message {

  /** Register new message -- returns
   *    {id, from_username, to_username, body, sent_at}
   */

  static async create({ from_username, to_username, body }) {
    const result = await db.query(
          `INSERT INTO messages (from_username,
                                 to_username,
                                 body,
                                 sent_at)
             VALUES
               ($1, $2, $3, current_timestamp)
             RETURNING id, from_username, to_username, body, sent_at`,
        [from_username, to_username, body]);

    return result.rows[0];
  }

  /** Update read_at for message
   *
   * updates the read_at property to the current timestamp
   *
   * returns {id, read_at}
   *
   **/

  static async markRead(id) {
    const result = await db.query(
          `UPDATE messages
           SET read_at = current_timestamp
             WHERE id = $1
             RETURNING id, read_at`,
        [id]);
    const message = result.rows[0];

    if (!message) throw new NotFoundError(`No such message: ${id}`);

    return message;
  }

  /** Get: get message by id
   *
   * returns {id, from_user, to_user, body, sent_at, read_at}
   *
   * both to_user and from_user = {username, first_name, last_name, phone}
   *
   */

  static async get(id) {
    const result = await db.query(
          `SELECT m.id,
                  m.from_username,
                  f.first_name AS from_first_name,
                  f.last_name AS from_last_name,
                  f.phone AS from_phone,
                  m.to_username,
                  t.first_name AS to_first_name,
                  t.last_name AS to_last_name,
                  t.phone AS to_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.id = $1`,
        [id]);

    let m = result.rows[0];

    if (!m) throw new NotFoundError(`No such message: ${id}`);

    return {
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.from_first_name,
        last_name: m.from_last_name,
        phone: m.from_phone,
      },
      to_user: {
        username: m.to_username,
        first_name: m.to_first_name,
        last_name: m.to_last_name,
        phone: m.to_phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    };
  }


  /** Get: grabs from_username and authenticates
   *
   * auth passes message id, current user
   *
   * query db using message id for from_username
   *
   * return true/false, if curruser/from_username matches
   */

  static async isUserAuthor(messageId, currentUser){
    const result = await db.query(
      `SELECT from_username
        FROM messages
        WHERE id = $1`, [messageId]
    );

    const messageAuthor = result.rows[0].from_username;

    return messageAuthor === currentUser;

  }


    /** Get: grabs to_username and authenticates
   *
   * auth passes message id, current user
   *
   * query db using message id for to_username
   *
   * return true/false if curruser/to_username matches
   */

    static async isUserRecipient(messageId, currentUser){
      const result = await db.query(
        `SELECT to_username
          FROM messages
          WHERE id = $1`, [messageId]
      );

      const messageRecipient = result.rows[0].to_username;

      return messageRecipient === currentUser;
    }
}
module.exports = Message;
