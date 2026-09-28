const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const config = require('./config');

function app() {
  const server = express();
  server.use(helmet());
  server.use(express.json({ limit: '1mb' }));
  return server;
}

function ok(res, data, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function fail(res, status, message, error) {
  return res.status(status).json({ success: false, message, error });
}

function requireAdmin(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return fail(res, 401, 'Token diperlukan', 'UNAUTHORIZED');
  try {
    req.admin = jwt.verify(token, config.jwtSecret());
    if (req.admin.role !== 'admin') return fail(res, 403, 'Akses ditolak', 'FORBIDDEN');
    next();
  } catch {
    return fail(res, 401, 'Token tidak valid atau kedaluwarsa', 'UNAUTHORIZED');
  }
}

function errors(server) {
  server.use((req, res) => fail(res, 404, 'Endpoint tidak ditemukan', 'NOT_FOUND'));
  server.use((err, req, res, next) => {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Data sudah digunakan', 'CONFLICT');
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return fail(res, 400, 'Referensi data tidak valid', 'INVALID_REFERENCE');
    return fail(res, 500, 'Terjadi kesalahan internal', 'INTERNAL_ERROR');
  });
}

module.exports = { app, ok, fail, requireAdmin, errors };
