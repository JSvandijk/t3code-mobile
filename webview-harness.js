const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const repoPath = (targetPath) => path.resolve(__dirname, targetPath);
const harnessHtml = fs.readFileSync(repoPath('tmp-webview-harness/index.html'), 'utf8');

const defaults = {
  'http': { protocol: 'http', port: 4888 },
  'https-bad-cert': { protocol: 'https', port: 4889 },
  redirect: { protocol: 'http', port: 4888 },
};

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  if (direct) {
    return direct.slice(prefix.length);
  }

  const spacedIndex = process.argv.indexOf(`--${name}`);
  if (spacedIndex !== -1 && process.argv[spacedIndex + 1]) {
    return process.argv[spacedIndex + 1];
  }

  return fallback;
}

function readNumberArg(name, fallback) {
  const value = readArg(name, String(fallback));
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric value for --${name}: ${value}`);
  }
  return parsed;
}

function resolveMaybeRelative(targetPath) {
  return path.isAbsolute(targetPath) ? targetPath : repoPath(targetPath);
}

const mode = readArg('mode', process.env.HARNESS_MODE || 'http');
if (!defaults[mode]) {
  throw new Error(`Unsupported harness mode: ${mode}`);
}

const host = readArg('host', process.env.HARNESS_HOST || '0.0.0.0');
const port = readNumberArg('port', process.env.HARNESS_PORT || defaults[mode].port);
const redirectTarget = readArg(
  'redirect-target',
  process.env.HARNESS_REDIRECT_TARGET || 'https://10.0.2.2:4889/'
);

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function createRequestHandler(currentMode) {
  return (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (requestUrl.pathname === '/status') {
      writeJson(res, 200, {
        ok: true,
        mode: currentMode,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (currentMode === 'redirect') {
      res.writeHead(302, {
        Location: redirectTarget,
        'Cache-Control': 'no-store',
      });
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(harnessHtml);
  };
}

function createServer(currentMode) {
  if (currentMode === 'https-bad-cert') {
    const keyPath = resolveMaybeRelative(readArg('ssl-key', process.env.SSL_KEY_PATH || './key.pem'));
    const certPath = resolveMaybeRelative(readArg('ssl-cert', process.env.SSL_CERT_PATH || './cert.pem'));

    return https.createServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }, createRequestHandler(currentMode));
  }

  return http.createServer(createRequestHandler(currentMode));
}

const server = createServer(mode);
const protocol = defaults[mode].protocol;
const localUrl = `${protocol}://127.0.0.1:${port}/`;
const emulatorUrl = `${protocol}://10.0.2.2:${port}/`;

server.listen(port, host, () => {
  console.log('');
  console.log('  ==========================================');
  console.log('  T3 Code Mobile WebView Harness');
  console.log('  ==========================================');
  console.log(`  Mode:         ${mode}`);
  console.log(`  Listen host:  ${host}`);
  console.log(`  Local URL:    ${localUrl}`);
  console.log(`  Emulator URL: ${emulatorUrl}`);
  if (mode === 'redirect') {
    console.log(`  Redirect to:  ${redirectTarget}`);
  }
  console.log('  Status URL:   /status');
  console.log('  ==========================================');
  console.log('');
});

server.on('error', (error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
