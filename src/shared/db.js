const mysql = require('mysql2/promise');
const config = require('./config');

let pool;
function getPool() {
  if (!pool) pool = mysql.createPool(config.db());
  return pool;
}

module.exports = { getPool };
