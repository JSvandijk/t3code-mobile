const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const repoPath = (targetPath) => path.resolve(__dirname, targetPath);
const fromEnvOrDefault = (name, fallback) => process.env[name] || fallback;
const resolveMaybeRelative = (targetPath) =>
  path.isAbsolute(targetPath) ? targetPath : repoPath(targetPath);

const HTTPS_PORT = Number(fromEnvOrDefault('HTTPS_PORT', '3780'));
const T3_TARGET = fromEnvOrDefault('T3_TARGET', 'http://127.0.0.1:3773');
const PUBLIC_URL = fromEnvOrDefault('PUBLIC_URL', `https://localhost:${HTTPS_PORT}`);
const SSL_KEY_PATH = resolveMaybeRelative(fromEnvOrDefault('SSL_KEY_PATH', './key.pem'));
const SSL_CERT_PATH = resolveMaybeRelative(fromEnvOrDefault('SSL_CERT_PATH', './cert.pem'));

const sslOptions = {
  key: fs.readFileSync(SSL_KEY_PATH),
  cert: fs.readFileSync(SSL_CERT_PATH),
};

const staticFiles = {
  '/manifest.json': { file: 'manifest.json', type: 'application/manifest+json' },
  '/sw.js': { file: 'sw.js', type: 'application/javascript' },
  '/icon.svg': { file: 'icon.svg', type: 'image/svg+xml' },
  '/icon-192.png': { file: 'icon-192.png', type: 'image/png' },
  '/icon-512.png': { file: 'icon-512.png', type: 'image/png' },
};

const pwaInject = `
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#161616">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="T3 Code">
    <link rel="apple-touch-icon" href="/icon-192.png">
    <meta name="mobile-web-app-capable" content="yes">
    <style>
      html, body { overscroll-behavior: none; }
      body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    </style>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('[PWA] SW OK'))
          .catch(e => console.error('[PWA] SW fail:', e));
      }
    </script>
`;

const proxy = httpProxy.createProxyServer({
  target: T3_TARGET,
  ws: true,
  selfHandleResponse: true,
});

proxy.on('proxyReq', (proxyReq) => {
  proxyReq.removeHeader('Accept-Encoding');
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  const contentType = proxyRes.headers['content-type'] || '';
  const encoding = proxyRes.headers['content-encoding'];
  const headers = { ...proxyRes.headers };
  delete headers['content-length'];
  delete headers['content-encoding'];
  delete headers['transfer-encoding'];

  if (contentType.includes('text/html')) {
    const chunks = [];
    proxyRes.on('data', (chunk) => chunks.push(chunk));
    proxyRes.on('end', () => {
      let buffer = Buffer.concat(chunks);
      try {
        if (encoding === 'gzip') buffer = zlib.gunzipSync(buffer);
        else if (encoding === 'br') buffer = zlib.brotliDecompressSync(buffer);
        else if (encoding === 'deflate') buffer = zlib.inflateSync(buffer);
      } catch (e) { /* ignore */ }

      let body = buffer.toString('utf-8');
      if (body.includes('</head>')) {
        body = body.replace('</head>', pwaInject + '\n</head>');
      }
      res.writeHead(proxyRes.statusCode, headers);
      res.end(body);
    });
  } else {
    if (encoding) headers['content-encoding'] = encoding;
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  }
});

proxy.on('error', (err, req, res) => {
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`<html><head>${pwaInject}<style>
      body{background:#161616;color:#e0e0e0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
      h1{color:#6C63FF}button{background:#6C63FF;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:1rem;cursor:pointer;margin-top:1rem}
    </style></head><body><div style="text-align:center"><h1>T3</h1><p>T3 Code is unavailable</p><button onclick="location.reload()">Retry</button></div></body></html>`);
  }
});

const handler = (req, res) => {
  const urlPath = req.url.split('?')[0];
  if (staticFiles[urlPath]) {
    const { file, type } = staticFiles[urlPath];
    try {
      const content = fs.readFileSync(path.join(__dirname, file));
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      res.end(content);
      return;
    } catch (e) { /* fall through */ }
  }
  proxy.web(req, res);
};

const server = https.createServer(sslOptions, handler);

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ==========================================');
  console.log('  T3 Code Mobile PWA Proxy');
  console.log('  ==========================================');
  console.log(`  Public URL: ${PUBLIC_URL}`);
  console.log(`  Target:     ${T3_TARGET}`);
  console.log(`  Key path:   ${SSL_KEY_PATH}`);
  console.log(`  Cert path:  ${SSL_CERT_PATH}`);
  console.log('  ==========================================');
  console.log('');
});
