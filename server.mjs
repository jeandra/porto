import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.frag': 'application/octet-stream',
  '.map': 'application/json; charset=utf-8',
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function startServer(port = 3000) {
  const server = http.createServer((req, res) => {
    // Parse URL and sanitize path
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(reqUrl.pathname);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    } else if (reqPath.endsWith('/')) {
      // Directory URLs (e.g. the Flutter demo) serve their index.html.
      reqPath += 'index.html';
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Try public/ directory if not found in root
        const fallbackPath = path.join(__dirname, 'public', safePath);
        fs.stat(fallbackPath, (fbErr, fbStats) => {
          if (fbErr || !fbStats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
          }
          serveFile(fallbackPath, fbStats, req, res);
        });
        return;
      }
      serveFile(filePath, stats, req, res);
    });
  });

  function serveFile(filePath, stats, req, res) {
    const contentType = getContentType(filePath);
    const etag = '"' + stats.size.toString(16) + '-' + Math.floor(stats.mtimeMs).toString(16) + '"';
    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'ETag': etag,
      'Last-Modified': stats.mtime.toUTCString(),
    };

    // Cache-Control: no-cache means "revalidate", so repeat visits to evicted
    // frames cost a cheap 304 instead of a full image download.
    if (req.headers['if-none-match'] === etag) {
      delete headers['Content-Length'];
      res.writeHead(304, headers);
      res.end();
      return;
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 Server is running at:\n👉 http://localhost:${port}\n`);
  });
}

startServer(Number(process.env.PORT) || 3000);
