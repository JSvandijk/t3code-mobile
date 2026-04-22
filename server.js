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
const HEALTH_PATH = '/__t3mobile/health';
const HEALTH_PROBE_TIMEOUT_MS = 5000;
const HEALTH_CACHE_TTL_MS = 5000;
const MAX_HTML_BODY_BYTES = 10 * 1024 * 1024;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function failFast(message) {
  console.error(`[t3code-mobile] ${message}`);
  process.exit(1);
}

function parseIntegerEnv(name, fallback, minimum) {
  const rawValue = fromEnvOrDefault(name, String(fallback));
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    failFast(`${name} must be an integer >= ${minimum}. Received: ${rawValue}`);
  }
  return parsed;
}

function parseUrlEnv(name, fallback, allowedProtocols) {
  const rawValue = fromEnvOrDefault(name, fallback);
  let parsed;

  try {
    parsed = new URL(rawValue);
  } catch (error) {
    failFast(`${name} must be a valid absolute URL. Received: ${rawValue}`);
  }

  if (!allowedProtocols.includes(parsed.protocol)) {
    failFast(`${name} must use one of: ${allowedProtocols.join(', ')}. Received: ${parsed.protocol}`);
  }

  return parsed;
}

function loadTlsCredentials(keyPath, certPath) {
  try {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      failFast(
        `Missing TLS material. Expected key at ${keyPath} and certificate at ${certPath}. ` +
        'Generate local development certificates or point SSL_KEY_PATH and SSL_CERT_PATH at real files.',
      );
    }

    failFast(`Unable to load TLS material: ${error.message}`);
  }
}

const HTTPS_PORT = parseIntegerEnv('HTTPS_PORT', 3780, 1);
const T3_TARGET_URL = parseUrlEnv('T3_TARGET', 'http://127.0.0.1:3773', ['http:', 'https:']);
const T3_TARGET = T3_TARGET_URL.toString();
const PUBLIC_URL = parseUrlEnv('PUBLIC_URL', `https://localhost:${HTTPS_PORT}`, ['https:']).toString();
const SSL_KEY_PATH = resolveMaybeRelative(fromEnvOrDefault('SSL_KEY_PATH', './key.pem'));
const SSL_CERT_PATH = resolveMaybeRelative(fromEnvOrDefault('SSL_CERT_PATH', './cert.pem'));
const UPSTREAM_TIMEOUT_MS = parseIntegerEnv('UPSTREAM_TIMEOUT_MS', 15000, 100);
const upstreamUrl = T3_TARGET_URL;
const upstreamAgent = upstreamUrl.protocol === 'https:'
  ? new https.Agent({ keepAlive: true })
  : new http.Agent({ keepAlive: true });
const healthHttpAgent = new http.Agent({ keepAlive: true });
const healthHttpsAgent = new https.Agent({ keepAlive: true });
const sslOptions = loadTlsCredentials(SSL_KEY_PATH, SSL_CERT_PATH);
const baseResponseHeaders = {
  'X-T3Mobile-Proxy': pkg.version,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss: ws:; font-src 'self'; frame-ancestors 'none'",
};

const writeHeaders = (res, statusCode, headers) => {
  res.writeHead(statusCode, {
    ...baseResponseHeaders,
    ...headers,
  });
};

const staticFileDefinitions = {
  '/manifest.json': { file: 'manifest.json', type: 'application/manifest+json', cacheControl: 'no-cache' },
  '/sw.js': { file: 'sw.js', type: 'application/javascript', cacheControl: 'no-store, must-revalidate' },
  '/icon.svg': { file: 'icon.svg', type: 'image/svg+xml', cacheControl: 'public, max-age=86400' },
  '/icon-192.png': { file: 'icon-192.png', type: 'image/png', cacheControl: 'public, max-age=86400' },
  '/icon-512.png': { file: 'icon-512.png', type: 'image/png', cacheControl: 'public, max-age=86400' },
};

const staticFiles = {};
for (const [urlPath, def] of Object.entries(staticFileDefinitions)) {
  try {
    staticFiles[urlPath] = {
      content: fs.readFileSync(path.join(__dirname, def.file)),
      type: def.type,
      cacheControl: def.cacheControl,
    };
  } catch (e) {
    console.warn(`[t3code-mobile] Static file not found at startup: ${def.file}`);
  }
}

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
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: UPSTREAM_TIMEOUT_MS,
  timeout: UPSTREAM_TIMEOUT_MS,
});

const requestTarget = (targetUrl) => new Promise((resolve) => {
  const url = new URL(targetUrl);
  const client = url.protocol === 'https:' ? https : http;
  const startedAt = Date.now();
  let previewBytes = 0;
  const request = client.request(url, {
    method: 'GET',
    timeout: Math.min(UPSTREAM_TIMEOUT_MS, HEALTH_PROBE_TIMEOUT_MS),
    agent: url.protocol === 'https:' ? healthHttpsAgent : healthHttpAgent,
    headers: {
      Accept: 'text/html,application/json;q=0.9,*/*;q=0.1',
      'User-Agent': `t3code-mobile-health/${pkg.version}`,
    },
  }, (response) => {
    const chunks = [];
    response.on('data', (chunk) => {
      if (previewBytes < 512) {
        const remaining = 512 - previewBytes;
        const chunkSlice = chunk.subarray(0, remaining);
        chunks.push(chunkSlice);
        previewBytes += chunkSlice.length;
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
        timeoutMs: Math.min(UPSTREAM_TIMEOUT_MS, HEALTH_PROBE_TIMEOUT_MS),
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
      timeoutMs: Math.min(UPSTREAM_TIMEOUT_MS, HEALTH_PROBE_TIMEOUT_MS),
    });
  });
  request.end();
});

const sendJson = (res, statusCode, payload) => {
  writeHeaders(res, statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, must-revalidate',
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
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <div class="meta">HTTP ${escapeHtml(String(statusCode))}</div>
      <button onclick="location.reload()">Retry</button>
    </div>
  </body>
</html>`;

const sendProxyErrorResponse = (res, err) => {
  if (!res || !res.writeHead || res.headersSent || res.writableEnded) {
    return;
  }

  if (err && err.message) {
    console.error(`[t3code-mobile] Proxy error: ${err.message}`);
  }

  const statusCode = 502;
  const title = 'T3 Code is unavailable';
  const message = 'The proxy could not reach your upstream T3 Code session. Verify that T3 Code is still running, the target URL is correct, and your private network path is reachable.';

  writeHeaders(res, statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, must-revalidate',
  });
  res.end(renderProxyErrorPage({ statusCode, title, message }));
};

let lastHealthResult = null;
let lastHealthTimestamp = 0;

const serveHealth = async (res) => {
  const now = Date.now();
  if (lastHealthResult && (now - lastHealthTimestamp) < HEALTH_CACHE_TTL_MS) {
    sendJson(res, lastHealthResult.ok ? 200 : 503, lastHealthResult);
    return;
  }

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
    tls: { loaded: true },
    upstream,
  };

  lastHealthResult = payload;
  lastHealthTimestamp = now;
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
  headers['x-content-type-options'] = 'nosniff';
  headers['referrer-policy'] = 'no-referrer';
  headers['x-robots-tag'] = 'noindex, nofollow';
  headers['x-t3mobile-proxy'] = pkg.version;

  if (contentType.includes('text/html')) {
    const chunks = [];
    let totalBytes = 0;
    let oversized = false;
    proxyRes.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_HTML_BODY_BYTES) {
        oversized = true;
      }
      if (!oversized) {
        chunks.push(chunk);
      }
    });
    proxyRes.on('end', () => {
      if (oversized) {
        if (encoding) headers['content-encoding'] = encoding;
        writeHeaders(res, proxyRes.statusCode, headers);
        res.end('<!-- response too large for PWA injection -->');
        return;
      }

      let buffer = Buffer.concat(chunks);
      try {
        if (encoding === 'gzip') buffer = zlib.gunzipSync(buffer);
        else if (encoding === 'br') buffer = zlib.brotliDecompressSync(buffer);
        else if (encoding === 'deflate') buffer = zlib.inflateSync(buffer);
      } catch (decompressError) {
        console.error(`[t3code-mobile] Failed to decompress upstream response: ${decompressError.message}`);
        writeHeaders(res, 502, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, must-revalidate',
        });
        res.end(renderProxyErrorPage({
          statusCode: 502,
          title: 'Decompression failed',
          message: 'The proxy could not decompress the upstream response. This may indicate a corrupted response from the T3 Code server.',
        }));
        return;
      }

      let body = buffer.toString('utf-8');
      body = injectPwaMarkup(body);
      headers['cache-control'] = 'no-store, must-revalidate';
      headers.vary = 'Accept-Encoding';
      writeHeaders(res, proxyRes.statusCode, headers);
      res.end(body);
    });
  } else {
    if (encoding) headers['content-encoding'] = encoding;
    writeHeaders(res, proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  }
});

proxy.on('error', (err, req, res) => {
  sendProxyErrorResponse(res, err);
});

const handler = (req, res) => {
  for (const [key, value] of Object.entries(baseResponseHeaders)) {
    res.setHeader(key, value);
  }
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
    const { content, type, cacheControl } = staticFiles[urlPath];
    writeHeaders(res, 200, { 'Content-Type': type, 'Cache-Control': cacheControl });
    res.end(content);
    return;
  }
  proxy.web(req, res);
};

const server = https.createServer(sslOptions, handler);
server.requestTimeout = UPSTREAM_TIMEOUT_MS + 5000;
server.headersTimeout = UPSTREAM_TIMEOUT_MS + 10000;
server.keepAliveTimeout = 5000;

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const shutdown = (signal) => {
  console.log(`[t3code-mobile] Received ${signal}. Shutting down proxy.`);
  server.close(() => {
    proxy.close();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ==========================================');
  console.log('  T3 Code Mobile PWA Proxy');
  console.log('  ==========================================');
  console.log(`  Public URL: ${PUBLIC_URL}`);
  console.log(`  Target:     ${T3_TARGET}`);
  console.log(`  Timeout:    ${UPSTREAM_TIMEOUT_MS} ms`);
  console.log(`  TLS:        loaded`);
  console.log('  ==========================================');
  console.log('');
});
