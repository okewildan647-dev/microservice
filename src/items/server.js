const { getPool } = require('../shared/db');
const { app, ok, fail, requireAdmin, errors } = require('../shared/http');
const config = require('../shared/config');
const server = app();
server.use(requireAdmin);

server.get('/items', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1), limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [rows] = await getPool().execute('SELECT i.*, c.name AS category_name FROM items i JOIN categories c ON c.id=i.category_id ORDER BY i.id LIMIT ? OFFSET ?', [limit, (page-1)*limit]);
    return ok(res, { items: rows, page, limit });
  } catch (err) { next(err); }
});
server.get('/items/:id', async (req, res, next) => {
  try {
    const [rows] = await getPool().execute('SELECT * FROM items WHERE id=?', [req.params.id]);
    return rows.length ? ok(res, rows[0]) : fail(res, 404, 'Barang tidak ditemukan', 'NOT_FOUND');
  } catch (err) { next(err); }
});
server.post('/items', async (req, res, next) => {
  try {
    const { category_id, item_code, name, price = 0, current_stock = 0 } = req.body || {};
    if (!category_id || !item_code || !name || !Number.isFinite(Number(price)) || Number(price)<0 || !Number.isInteger(Number(current_stock)) || Number(current_stock)<0) return fail(res, 400, 'Data barang tidak valid', 'INVALID_INPUT');
    const [result] = await getPool().execute('INSERT INTO items(category_id,item_code,name,price,current_stock) VALUES(?,?,?,?,?)', [category_id,item_code,name,price,current_stock]);
    return ok(res, { id: result.insertId, item_code, name, current_stock }, 'Barang berhasil ditambahkan', 201);
  } catch (err) { next(err); }
});
server.put('/items/:id', async (req, res, next) => {
  try {
    const { category_id, item_code, name, price } = req.body || {};
    if (!category_id || !item_code || !name || !Number.isFinite(Number(price)) || Number(price)<0) return fail(res, 400, 'Data barang tidak valid', 'INVALID_INPUT');
    const [result] = await getPool().execute('UPDATE items SET category_id=?,item_code=?,name=?,price=? WHERE id=?', [category_id,item_code,name,price,req.params.id]);
    return result.affectedRows ? ok(res, { id: Number(req.params.id) }, 'Barang berhasil diperbarui') : fail(res, 404, 'Barang tidak ditemukan', 'NOT_FOUND');
  } catch (err) { next(err); }
});
server.delete('/items/:id', async (req, res, next) => {
  try {
    const [tx] = await getPool().execute('SELECT id FROM stock_transactions WHERE item_id=? LIMIT 1', [req.params.id]);
    if (tx.length) return fail(res, 409, 'Barang memiliki riwayat transaksi', 'ITEM_HAS_HISTORY');
    const [result] = await getPool().execute('DELETE FROM items WHERE id=?', [req.params.id]);
    return result.affectedRows ? ok(res, null, 'Barang berhasil dihapus') : fail(res, 404, 'Barang tidak ditemukan', 'NOT_FOUND');
  } catch (err) { next(err); }
});
errors(server);
server.listen(config.port('ITEMS_PORT',3002),()=>console.log('Items service ready'));
