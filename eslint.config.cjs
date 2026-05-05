const nodeGlobals = {
  __dirname: "readonly",
  __filename: "readonly",
  Buffer: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  exports: "writable",
  global: "readonly",
  module: "writable",
  process: "readonly",
  require: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
};

const browserGlobals = {
  Blob: "readonly",
  ClipboardEvent: "readonly",
  CustomEvent: "readonly",
  DataTransfer: "readonly",
  document: "readonly",
  Event: "readonly",
  File: "readonly",
  FileReader: "readonly",
  FormData: "readonly",
  HTMLElement: "readonly",
  Image: "readonly",
  localStorage: "readonly",
  location: "readonly",
  MutationObserver: "readonly",
  navigator: "readonly",
  Notification: "readonly",
  window: "readonly",
};

const serviceWorkerGlobals = {
  caches: "readonly",
  clients: "readonly",
  fetch: "readonly",
  Request: "readonly",
  Response: "readonly",
  self: "readonly",
};

module.exports = [
  {
    ignores: ["node_modules/**", "apk/**", "harness-pages/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: nodeGlobals,
      sourceType: "commonjs",
    },
    rules: {
      eqeqeq: "error",
      "no-console": "off",
      "no-implicit-globals": "error",
      "no-throw-literal": "error",
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "warn",
    },
  },
  {
    files: ["lib/**/*.js", "test/**/*.js"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...browserGlobals,
      },
    },
  },
  {
    files: ["sw.js"],
    languageOptions: {
      globals: serviceWorkerGlobals,
      sourceType: "script",
    },
    rules: {
      "no-implicit-globals": "off",
    },
  },
];
