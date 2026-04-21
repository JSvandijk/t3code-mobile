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

function ensureNoTrackedKeystores() {
  try {
    const output = execFileSync('git', ['ls-files', '--', '*.keystore', '*.jks'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();

    if (output) {
      fail(`Tracked signing material is not allowed:\n${output}`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('git is not available; skipped tracked keystore check.');
      return;
    }

    if (typeof error.stdout === 'string' && error.stdout.trim()) {
      fail(error.stdout.trim());
    }

    throw error;
  }
}

function ensureWorkflowExists() {
  const workflowPath = path.join(root, '.github', 'workflows', 'release.yml');
  if (!fs.existsSync(workflowPath)) {
    fail('Missing .github/workflows/release.yml.');
  }
}

const pkg = readJson('package.json');
const manifest = readJson('manifest.json');

ensureSemver(pkg.version);
ensureManifestIcons(manifest);
ensureNoTrackedKeystores();
ensureWorkflowExists();

console.log(`release checks OK for version ${pkg.version}`);
