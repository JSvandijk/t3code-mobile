const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const selfsigned = require('selfsigned');

const repoPath = (targetPath) => path.resolve(__dirname, targetPath);
const harnessHtml = fs.readFileSync(repoPath('tmp-webview-harness/index.html'), 'utf8');
const demoWorkspaceHtml = fs.readFileSync(repoPath('tmp-webview-harness/demo-workspace.html'), 'utf8');
const demoProjectsHtml = fs.readFileSync(repoPath('tmp-webview-harness/demo-projects.html'), 'utf8');

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

async function ensureHttpsMaterials(keyPath, certPath) {
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      source: 'files',
    };
  }

  const generated = await selfsigned.generate([{
    name: 'commonName',
    value: '10.0.2.2',
  }], {
    algorithm: 'sha256',
    days: 2,
    keySize: 2048,
  });

  return {
    key: Buffer.from(generated.private, 'utf8'),
    cert: Buffer.from(generated.cert, 'utf8'),
    source: 'generated',
  };
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

    if (requestUrl.pathname === '/demo/workspace') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(demoWorkspaceHtml);
      return;
    }

    if (requestUrl.pathname === '/demo/projects') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(demoProjectsHtml);
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

async function createServer(currentMode) {
  if (currentMode === 'https-bad-cert') {
    const keyPath = resolveMaybeRelative(readArg('ssl-key', process.env.SSL_KEY_PATH || './key.pem'));
    const certPath = resolveMaybeRelative(readArg('ssl-cert', process.env.SSL_CERT_PATH || './cert.pem'));
    const materials = await ensureHttpsMaterials(keyPath, certPath);

    return https.createServer({
      key: materials.key,
      cert: materials.cert,
    }, createRequestHandler(currentMode));
  }

  return http.createServer(createRequestHandler(currentMode));
}

const protocol = defaults[mode].protocol;
const localUrl = `${protocol}://127.0.0.1:${port}/`;
const emulatorUrl = `${protocol}://10.0.2.2:${port}/`;
const certSource = mode === 'https-bad-cert'
  ? (() => {
      const keyPath = resolveMaybeRelative(readArg('ssl-key', process.env.SSL_KEY_PATH || './key.pem'));
      const certPath = resolveMaybeRelative(readArg('ssl-cert', process.env.SSL_CERT_PATH || './cert.pem'));
      return fs.existsSync(keyPath) && fs.existsSync(certPath) ? 'local files' : 'generated self-signed cert';
    })()
  : null;

async function main() {
  const server = await createServer(mode);

  server.listen(port, host, () => {
    console.log('');
    console.log('  ==========================================');
    console.log('  T3 Code Mobile WebView Harness');
    console.log('  ==========================================');
    console.log(`  Mode:         ${mode}`);
    console.log(`  Listen host:  ${host}`);
    console.log(`  Local URL:    ${localUrl}`);
    console.log(`  Emulator URL: ${emulatorUrl}`);
    if (certSource) {
      console.log(`  TLS source:   ${certSource}`);
    }
    if (mode === 'redirect') {
      console.log(`  Redirect to:  ${redirectTarget}`);
    }
    console.log('  Status URL:   /status');
    console.log('  Demo URLs:    /demo/workspace , /demo/projects');
    console.log('  ==========================================');
    console.log('');
  });

  server.on('error', (error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
