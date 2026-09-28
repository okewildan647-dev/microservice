const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, 'preview', 'index.html');
const port = Number(process.env.PREVIEW_PORT || 4173);
http.createServer((req, res) => {
  if (req.url !== '/' && req.url !== '/index.html') {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Preview available at http://127.0.0.1:${port}`));
