const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = __dirname;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function listTrackedFiles() {
  try {
    return execFileSync('git', ['ls-files'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('git is not available; skipped tracked-file checks.');
      return [];
    }

    if (typeof error.stdout === 'string' && error.stdout.trim()) {
      fail(error.stdout.trim());
    }

    throw error;
  }
}

function parsePngSize(file) {
  const buffer = fs.readFileSync(file);
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    fail(`Expected a PNG file: ${file}`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function ensureManifestIcons(manifest) {
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    fail('manifest.json must declare at least one icon.');
  }

  for (const icon of manifest.icons) {
    if (!icon.src || !icon.sizes) {
      fail('Every manifest icon must include src and sizes.');
    }

    const iconPath = path.join(root, icon.src.replace(/^\//, ''));
    if (!fs.existsSync(iconPath)) {
      fail(`Manifest icon is missing: ${icon.src}`);
    }

    const declaredSize = icon.sizes.split('x').map((value) => Number(value));
    if (declaredSize.length !== 2 || declaredSize.some((value) => !Number.isInteger(value) || value <= 0)) {
      fail(`Invalid icon size declaration: ${icon.sizes}`);
    }

    const actualSize = parsePngSize(iconPath);
    if (actualSize.width !== declaredSize[0] || actualSize.height !== declaredSize[1]) {
      fail(`Icon ${icon.src} is ${actualSize.width}x${actualSize.height}, expected ${icon.sizes}.`);
    }
  }
}

function ensureSemver(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    fail(`package.json version must use x.y.z format, received ${version}.`);
  }
}

function ensureNoTrackedSensitiveFiles(trackedFiles) {
  const matches = trackedFiles.filter((file) => {
    const lower = file.toLowerCase();
    return /\.(keystore|jks|p12|pem)$/i.test(lower)
      || lower.endsWith('.env')
      || lower.endsWith('.env.local')
      || lower.endsWith('.env.production');
  });

  if (matches.length > 0) {
    fail(`Tracked secrets or signing material are not allowed:\n${matches.join('\n')}`);
  }
}

function ensureNoTrackedGeneratedArtifacts(trackedFiles) {
  const transientRootFiles = new Set([
    'emulator-screen.png',
    'emulator-screen-clean.png',
    't3-after-connect.png',
    't3-after-connect.xml',
    't3-connect-pass.png',
    't3-connect-pass.xml',
    't3-harness-result.png',
    't3-harness-result.xml',
    't3-ui.xml',
    't3-https-entry.xml',
  ]);

  const matches = trackedFiles.filter((file) => {
    const normalized = file.replace(/\\/g, '/');
    const base = path.basename(normalized).toLowerCase();
    const isRootFile = !normalized.includes('/');

    if (transientRootFiles.has(base)) {
      return true;
    }

    if (isRootFile && (base.endsWith('.apk') || base.endsWith('.aab') || base.endsWith('.sha256'))) {
      return true;
    }

    if (isRootFile && /^t3code-v\d+\.\d+\.\d+\.(apk|aab|sha256|zip)$/i.test(base)) {
      return true;
    }

    if (isRootFile && /^t3code(\.apk|\.zip)$/i.test(base)) {
      return true;
    }

    return false;
  });

  if (matches.length > 0) {
    fail(`Tracked generated artifacts are not allowed in the repository root:\n${matches.join('\n')}`);
  }
}

function ensureWorkflowExists() {
  const workflowPath = path.join(root, '.github', 'workflows', 'release.yml');
  if (!fs.existsSync(workflowPath)) {
    fail('Missing .github/workflows/release.yml.');
  }
}

function ensureRequiredDocsExist() {
  const requiredDocs = [
    'README.md',
    'SECURITY.md',
    'CONTRIBUTING.md',
    'docs/WEBVIEW-HARNESS.md',
    'docs/RUNTIME-VERIFICATION.md',
    'docs/RELEASE-RUNBOOK.md',
  ];

  for (const file of requiredDocs) {
    if (!fs.existsSync(path.join(root, file))) {
      fail(`Missing required project document: ${file}`);
    }
  }
}

const pkg = readJson('package.json');
const manifest = readJson('manifest.json');
const trackedFiles = listTrackedFiles();

ensureSemver(pkg.version);
ensureManifestIcons(manifest);
ensureNoTrackedSensitiveFiles(trackedFiles);
ensureNoTrackedGeneratedArtifacts(trackedFiles);
ensureWorkflowExists();
ensureRequiredDocsExist();

console.log(`release checks OK for version ${pkg.version}`);
