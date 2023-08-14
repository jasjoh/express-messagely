
const db = require("../db");

const User = require('./user');
const Message = require('./message');

main();

// run all our db work
async function main() {
  await clearDb();
  await populateDb();
  await endSession();
}

// need to end session to exit JS script
async function endSession() {
  await db.end();}

// clear out database
async function clearDb() {
  console.log("going to delete from messages");
  await db.query("DELETE FROM messages");
  console.log("going to delete from users");
  await db.query("DELETE FROM users");
  console.log("done with clearDb()");
}

// register users and messages
async function populateDb() {
  await User.register({
    username: 'a',
    password: 'password',
    first_name: 'a',
    last_name: 'a',
    phone: '555-5555'
  });

  await User.register({
    username: 'b',
    password: 'password',
    first_name: 'b',
    last_name: 'b',
    phone: '555-5555'
  });

  await User.register({
    username: 'c',
    password: 'password',
    first_name: 'c',
    last_name: 'c',
    phone: '555-5555'
  });

  console.log("done with creating users");

  await Message.create({
    from_username: 'a',
    to_username: 'b',
    body: 'whats up'
  });

  await Message.create({
    from_username: 'b',
    to_username: 'a',
    body: 'the sky'
  });

  await Message.create({
    from_username: 'a',
    to_username: 'b',
    body: 'yer funny bro'
  });

  await Message.create({
    from_username: 'b',
    to_username: 'a',
    body: 'not yer bro, friend'
  });

  await Message.create({
    from_username: 'a',
    to_username: 'b',
    body: 'not yer friend, guy'
  });

  await Message.create({
    from_username: 'c',
    to_username: 'a',
    body: 'who am i'
  });

  await Message.create({
    from_username: 'c',
    to_username: 'b',
    body: 'who am i'
  });

  console.log("done with creating messages");
}


