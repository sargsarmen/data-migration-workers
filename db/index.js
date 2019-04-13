const { Pool } = require("pg");

const config = require("../configs");

const pool = new Pool({
  user: config.postgre.user,
  host: config.postgre.host,
  database: config.postgre.dbName,
  password: config.postgre.password,
  port: config.postgre.port
});

module.exports = pool;
