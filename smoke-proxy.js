const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const selfsigned = require('selfsigned');

async function ensureTestCertificates() {
  const keyPath = path.join(__dirname, 'key.pem');
  const certPath = path.join(__dirname, 'cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return { keyPath, certPath, cleanup: () => {} };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 't3code-mobile-cert-'));
  const generated = await selfsigned.generate([{
    name: 'commonName',
    value: '127.0.0.1',
  }], {
    algorithm: 'sha256',
    days: 2,
    keySize: 2048,
  });

  const generatedKeyPath = path.join(tempDir, 'key.pem');
  const generatedCertPath = path.join(tempDir, 'cert.pem');
  fs.writeFileSync(generatedKeyPath, generated.private, 'utf8');
  fs.writeFileSync(generatedCertPath, generated.cert, 'utf8');

  return {
    keyPath: generatedKeyPath,
    certPath: generatedCertPath,
    cleanup: () => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    },
  };
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
    server.on('error', reject);
  });
}

async function waitFor(fn, timeoutMs) {
  const start = Date.now();
  let lastError;

  while (Date.now() - start < timeoutMs) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  throw lastError || new Error('Timed out waiting for the proxy to become ready.');
}

async function fetchJson(url) {
  const response = await request(url);
  return {
    ...response,
    json: JSON.parse(response.body),
  };
}

async function request(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function startHarnessServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>T3 Harness</title>
  </head>
  <body>
    <main>
      <h1>T3 Harness</h1>
      <p>Proxy smoke test target.</p>
    </main>
  </body>
</html>`);
    });

    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

async function main() {
  const harnessPort = await getFreePort();
  const proxyPort = await getFreePort();
  const harnessServer = await startHarnessServer(harnessPort);
  const testCertificates = await ensureTestCertificates();

  const proxyProcess = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: {
      ...process.env,
      HTTPS_PORT: String(proxyPort),
      T3_TARGET: `http://127.0.0.1:${harnessPort}`,
      PUBLIC_URL: `https://127.0.0.1:${proxyPort}`,
      UPSTREAM_TIMEOUT_MS: '250',
      SSL_KEY_PATH: testCertificates.keyPath,
      SSL_CERT_PATH: testCertificates.certPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let proxyLogs = '';
  proxyProcess.stdout.on('data', (chunk) => {
    proxyLogs += chunk.toString();
  });
  proxyProcess.stderr.on('data', (chunk) => {
    proxyLogs += chunk.toString();
  });

  const proxyBaseUrl = `https://127.0.0.1:${proxyPort}`;

  try {
    await waitFor(async () => {
      const response = await request(`${proxyBaseUrl}/__t3mobile/health`);
      if (!response.ok) {
        throw new Error(`Health endpoint returned ${response.status}`);
      }
      return true;
    }, 10000);

    const rootResponse = await request(proxyBaseUrl);
    const rootHtml = rootResponse.body;
    if (!rootResponse.ok) {
      throw new Error(`Proxy root returned ${rootResponse.status}`);
    }
    if (!rootHtml.includes('<link rel="manifest" href="/manifest.json">')) {
      throw new Error('Expected the proxy to inject the manifest link.');
    }
    if (!rootHtml.includes("navigator.serviceWorker.register('/sw.js')")) {
      throw new Error('Expected the proxy to inject service worker registration.');
    }

    const manifestResponse = await request(`${proxyBaseUrl}/manifest.json`);
    if (!manifestResponse.ok) {
      throw new Error(`manifest.json returned ${manifestResponse.status}`);
    }
    const manifest = JSON.parse(manifestResponse.body);
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      throw new Error('manifest.json did not contain any icons.');
    }

    const healthResponse = await fetchJson(`${proxyBaseUrl}/__t3mobile/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health endpoint returned ${healthResponse.status}`);
    }
    const health = healthResponse.json;
    if (health.service !== 't3code-mobile-proxy') {
      throw new Error('Health endpoint returned an unexpected service name.');
    }
    if (!Number.isFinite(health.upstreamTimeoutMs) || health.upstreamTimeoutMs !== 250) {
      throw new Error(`Health endpoint did not return the configured upstream timeout: ${JSON.stringify(health)}`);
    }
    if (!health.upstream || health.upstream.ok !== true || health.upstream.statusCode !== 200) {
      throw new Error(`Health endpoint did not report a healthy upstream target: ${JSON.stringify(health.upstream)}`);
    }
    if (!Number.isFinite(health.upstream.durationMs)) {
      throw new Error(`Health endpoint did not return upstream durationMs: ${JSON.stringify(health.upstream)}`);
    }

    console.log('proxy smoke test OK');
  } finally {
    harnessServer.close();
    proxyProcess.kill();
    testCertificates.cleanup();
  }

  if (proxyProcess.exitCode && proxyProcess.exitCode !== 0) {
    throw new Error(`Proxy process exited with code ${proxyProcess.exitCode}\n${proxyLogs}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
