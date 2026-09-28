const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../shared/config');
const { getPool } = require('../shared/db');
const { app, ok, fail, errors } = require('../shared/http');

const server = app();
server.post('/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
      return fail(res, 400, 'Username dan password wajib diisi', 'INVALID_INPUT');
    const [rows] = await getPool().execute('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
      return fail(res, 401, 'Kredensial tidak valid', 'UNAUTHORIZED');
    const token = jwt.sign({ sub: rows[0].id, username: rows[0].username, role: 'admin' }, config.jwtSecret(), { expiresIn: config.jwtExpiresIn() });
    return ok(res, { token, token_type: 'Bearer', expires_in: config.jwtExpiresIn() }, 'Login berhasil');
  } catch (err) { next(err); }
});
errors(server);
server.listen(config.port('AUTH_PORT', 3001), () => console.log('Auth service ready'));
