const postgres = require('postgres');

//warning, those parametrized queries are kinda wip

const sql = postgres({
    host: process.env.HOST,
    port: +process.env.PORT,
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  })

async function createDBTablesAndExstentions() {
  console.log("TESTING")
  await sql`CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, first_name TEXT, parent_email TEXT, user_id TEXT)`;
  await sql`CREATE TABLE IF NOT EXISTS refresh_tokens (user_id TEXT, token TEXT, valid_until TIMESTAMP)`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
}

async function loginUser(username, password) {
  const password_hash = await sql('SELECT password from users WHERE first_name = $1', [username]);
  const is_correct_password = await sql('SELECT (password_hash = crypt($1, $2)) AS password_match FROM users WHERE username = $3', [password, password_hash, username]);

  return is_correct_password;
}

async function createUser(username, password, first_name, parent_email, user_id, refresh_token) {
  await sql("INSERT INTO users (username, password, first_name, parent_email, user_id) VALUES ($1, crypt($2, gen_salt('md5')), $3, $4, $5)", [username, password, first_name, parent_email, user_id]);
  var date = new Date();
  date.setDate(date.getDate() + 7)
  await sql('INSERT INTO refresh_tokens (user_id, token, valid_until) VALUES ($1, $2, $3)', [user_id, refresh_token, date.toISOString().slice(0, 19).replace('T', ' ')]);
}

module.exports = { createUser, createDBTablesAndExstentions, sql }
