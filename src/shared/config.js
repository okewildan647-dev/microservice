require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

module.exports = {
  port: (name, fallback) => Number(process.env[name] || fallback),
  jwtSecret: () => required('JWT_SECRET'),
  jwtExpiresIn: () => process.env.JWT_EXPIRES_IN || '1h',
  db: () => ({
    host: required('DB_HOST'), port: Number(process.env.DB_PORT || 3306),
    database: required('DB_NAME'), user: required('DB_USER'), password: required('DB_PASSWORD'),
    connectionLimit: 10, decimalNumbers: true
  })
};
