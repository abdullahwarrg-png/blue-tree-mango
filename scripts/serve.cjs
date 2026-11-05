// Serve the production export at the same subpath as GitHub Pages.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const prefix = '/blue-tree-mango';
const types = { '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.json': 'application/json' };
http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === prefix) {
    response.writeHead(302, { Location: `${prefix}/` }).end();
    return;
  }
  if (!url.pathname.startsWith(`${prefix}/`)) {
    response.writeHead(404).end();
    return;
  }
  const relative = decodeURIComponent(url.pathname.slice(prefix.length));
  const filename = path.resolve(root, `.${relative === '/' ? '/index.html' : relative}`);
  if (!filename.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(filename, (error, data) => {
    if (error) return response.writeHead(404).end();
    response.writeHead(200, {
      'Content-Type': types[path.extname(filename)] || 'application/octet-stream',
    });
    response.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173/blue-tree-mango/'));
