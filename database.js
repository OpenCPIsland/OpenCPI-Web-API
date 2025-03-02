const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.USERNAME,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: +process.env.PORT,
  host: process.env.HOST,
})

//warning, those parametrized queries are kinda wip

async function createDBTablesAndExstentions() {
  console.log("TESTING")
  await pool.query("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, first_name TEXT, parent_email TEXT, user_id TEXT)");
  await pool.query("CREATE TABLE IF NOT EXISTS refresh_tokens (user_id TEXT, token TEXT, valid_until TIMESTAMP)");
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
}

async function loginUser(username, password) {
  const password_hash = await pool.query('SELECT password from users WHERE first_name = $1', [username]);
  const is_correct_password = await pool.query('SELECT (password_hash = crypt($1, $2)) AS password_match FROM users WHERE username = $3', [password, password_hash, username]);

  console.log(is_correct_password);

  return is_correct_password;
}

async function createUser(username, password, first_name, parent_email, user_id, refresh_token) {
  await pool.query("INSERT INTO users (username, password, first_name, parent_email, user_id) VALUES ($1, crypt($2, gen_salt('md5')), $3, $4, $5)", [username, password, first_name, parent_email, user_id]);
  var date = new Date();
  date.setDate(date.getDate() + 7)
  await pool.query('INSERT INTO refresh_tokens (user_id, token, valid_until) VALUES ($1, $2, $3)', [user_id, refresh_token, date.toISOString().slice(0, 19).replace('T', ' ')]);
}

module.exports = { createUser, createDBTablesAndExstentions, pool }
