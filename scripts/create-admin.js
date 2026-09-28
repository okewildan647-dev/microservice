const bcrypt = require('bcryptjs');
const config = require('../src/shared/config');
const { getPool } = require('../src/shared/db');

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password === 'change-this-before-starting') throw new Error('Set ADMIN_USERNAME dan ADMIN_PASSWORD yang kuat di .env');
  const hash = await bcrypt.hash(password, 12);
  await getPool().execute('INSERT INTO users(username,password_hash) VALUES(?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)', [username, hash]);
  console.log(`Admin ${username} siap.`);
  process.exit(0);
}
main().catch((error) => { console.error(error.message); process.exit(1); });
