const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const repoPath = (targetPath) => path.resolve(__dirname, targetPath);
const fromEnvOrDefault = (name, fallback) => process.env[name] || fallback;
const resolveMaybeRelative = (targetPath) =>
  path.isAbsolute(targetPath) ? targetPath : repoPath(targetPath);

const HTTPS_PORT = Number(fromEnvOrDefault('HTTPS_PORT', '3780'));
const T3_TARGET = fromEnvOrDefault('T3_TARGET', 'http://127.0.0.1:3773');
const PUBLIC_URL = fromEnvOrDefault('PUBLIC_URL', `https://localhost:${HTTPS_PORT}`);
const SSL_KEY_PATH = resolveMaybeRelative(fromEnvOrDefault('SSL_KEY_PATH', './key.pem'));
const SSL_CERT_PATH = resolveMaybeRelative(fromEnvOrDefault('SSL_CERT_PATH', './cert.pem'));
const HEALTH_PATH = '/__t3mobile/health';
const UPSTREAM_TIMEOUT_MS = Number(fromEnvOrDefault('UPSTREAM_TIMEOUT_MS', '15000'));
const upstreamUrl = new URL(T3_TARGET);
const upstreamAgent = upstreamUrl.protocol === 'https:'
  ? new https.Agent({ keepAlive: true })
  : new http.Agent({ keepAlive: true });
const healthHttpAgent = new http.Agent({ keepAlive: true });
const healthHttpsAgent = new https.Agent({ keepAlive: true });

const sslOptions = {
  key: fs.readFileSync(SSL_KEY_PATH),
  cert: fs.readFileSync(SSL_CERT_PATH),
};

const staticFiles = {
  '/manifest.json': { file: 'manifest.json', type: 'application/manifest+json', cacheControl: 'no-cache' },
  '/sw.js': { file: 'sw.js', type: 'application/javascript', cacheControl: 'no-store, must-revalidate' },
  '/icon.svg': { file: 'icon.svg', type: 'image/svg+xml', cacheControl: 'public, max-age=86400' },
  '/icon-192.png': { file: 'icon-192.png', type: 'image/png', cacheControl: 'public, max-age=86400' },
  '/icon-512.png': { file: 'icon-512.png', type: 'image/png', cacheControl: 'public, max-age=86400' },
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

const HEAD_CLOSE_RE = /<\/head\s*>/i;

const injectPwaMarkup = (html) => {
  if (HEAD_CLOSE_RE.test(html)) {
    return html.replace(HEAD_CLOSE_RE, `${pwaInject}\n</head>`);
  }

  const bodyIndex = html.search(/<body[\s>]/i);
  if (bodyIndex !== -1) {
    return `${html.slice(0, bodyIndex)}${pwaInject}\n${html.slice(bodyIndex)}`;
  }

  return `${pwaInject}\n${html}`;
};

const proxy = httpProxy.createProxyServer({
  target: T3_TARGET,
  ws: true,
  selfHandleResponse: true,
  agent: upstreamAgent,
});

const requestTarget = (targetUrl) => new Promise((resolve) => {
  const url = new URL(targetUrl);
  const client = url.protocol === 'https:' ? https : http;
  const startedAt = Date.now();
  const request = client.request(url, {
    method: 'GET',
    timeout: Math.min(UPSTREAM_TIMEOUT_MS, 5000),
    agent: url.protocol === 'https:' ? healthHttpsAgent : healthHttpAgent,
    headers: {
      Accept: 'text/html,application/json;q=0.9,*/*;q=0.1',
      'User-Agent': `t3code-mobile-health/${pkg.version}`,
    },
  }, (response) => {
    const chunks = [];
    response.on('data', (chunk) => {
      if (Buffer.concat(chunks).length < 512) {
        chunks.push(chunk);
      }
    });
    response.on('end', () => {
      const preview = Buffer.concat(chunks).toString('utf8').replace(/\s+/g, ' ').trim().slice(0, 200);
      resolve({
        ok: response.statusCode >= 200 && response.statusCode < 400,
        durationMs: Date.now() - startedAt,
        statusCode: response.statusCode,
        contentType: response.headers['content-type'] || null,
        preview,
        timeoutMs: Math.min(UPSTREAM_TIMEOUT_MS, 5000),
      });
    });
  });

  request.on('timeout', () => request.destroy(new Error('Timed out while probing the upstream target.')));
  request.on('error', (error) => {
    resolve({
      ok: false,
      durationMs: Date.now() - startedAt,
      statusCode: null,
      contentType: null,
      preview: '',
      error: error.message,
      timeoutMs: Math.min(UPSTREAM_TIMEOUT_MS, 5000),
    });
  });
  request.end();
});

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, must-revalidate',
    'X-T3Mobile-Proxy': pkg.version,
  });
  res.end(JSON.stringify(payload, null, 2));
};

const renderProxyErrorPage = ({ statusCode, title, message }) => `<!doctype html>
<html>
  <head>
    ${pwaInject}
    <style>
      body {
        background: #161616;
        color: #e0e0e0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
      }
      .card {
        max-width: 480px;
        width: 100%;
        background: rgba(17, 24, 39, 0.92);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 18px;
        padding: 24px;
        box-sizing: border-box;
      }
      h1 {
        color: #8B7BFF;
        font-size: 24px;
        margin: 0 0 12px;
      }
      p {
        color: #D1D5DB;
        line-height: 1.55;
        margin: 0 0 12px;
      }
      .meta {
        color: #9CA3AF;
        font-size: 14px;
        margin-bottom: 20px;
      }
      button {
        background: #6C63FF;
        color: #fff;
        border: none;
        padding: 12px 18px;
        border-radius: 10px;
        font-size: 15px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="meta">HTTP ${statusCode}</div>
      <button onclick="location.reload()">Retry</button>
    </div>
  </body>
</html>`;

const sendProxyErrorResponse = (res, err) => {
  if (!res || !res.writeHead || res.headersSent || res.writableEnded) {
    return;
  }

  const statusCode = 502;
  const title = 'T3 Code is unavailable';
  const message = 'The proxy could not reach your upstream T3 Code session. Verify that T3 Code is still running, the target URL is correct, and your private network path is reachable.';

  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, must-revalidate',
    'X-T3Mobile-Proxy': pkg.version,
  });
  res.end(renderProxyErrorPage({ statusCode, title, message }));
};

const serveHealth = async (res) => {
  const upstream = await requestTarget(T3_TARGET);
  const payload = {
    ok: upstream.ok,
    service: 't3code-mobile-proxy',
    version: pkg.version,
    publicUrl: PUBLIC_URL,
    target: T3_TARGET,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    upstreamTimeoutMs: UPSTREAM_TIMEOUT_MS,
    tls: {
      keyPath: SSL_KEY_PATH,
      certPath: SSL_CERT_PATH,
    },
    upstream,
  };

  sendJson(res, upstream.ok ? 200 : 503, payload);
};

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
  delete headers.etag;
  delete headers['last-modified'];
  delete headers.expires;
  delete headers.age;

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
      body = injectPwaMarkup(body);
      headers['cache-control'] = 'no-store, must-revalidate';
      headers.vary = 'Accept-Encoding';
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
  sendProxyErrorResponse(res, err);
});

const handler = (req, res) => {
  res.setHeader('X-T3Mobile-Proxy', pkg.version);
  const urlPath = req.url.split('?')[0];
  if (urlPath === HEALTH_PATH) {
    serveHealth(res).catch((error) => {
      sendJson(res, 500, {
        ok: false,
        service: 't3code-mobile-proxy',
        version: pkg.version,
        target: T3_TARGET,
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    });
    return;
  }

  if (staticFiles[urlPath]) {
    const { file, type, cacheControl } = staticFiles[urlPath];
    try {
      const content = fs.readFileSync(path.join(__dirname, file));
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cacheControl });
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
  console.log(`  Timeout:    ${UPSTREAM_TIMEOUT_MS} ms`);
  console.log(`  Key path:   ${SSL_KEY_PATH}`);
  console.log(`  Cert path:  ${SSL_CERT_PATH}`);
  console.log('  ==========================================');
  console.log('');
});
