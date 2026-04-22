const assert = require('assert');
const { escapeHtml, injectBeforeHeadClose } = require('../lib/html');

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`FAIL: ${name}`);
    console.error(`  ${e.message}`);
    process.exit(1);
  }
}

// --- escapeHtml ---

test('escapes ampersand', () => {
  assert.strictEqual(escapeHtml('a&b'), 'a&amp;b');
});

test('escapes angle brackets', () => {
  assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;');
});

test('escapes double quotes', () => {
  assert.strictEqual(escapeHtml('"hello"'), '&quot;hello&quot;');
});

test('escapes single quotes', () => {
  assert.strictEqual(escapeHtml("it's"), 'it&#39;s');
});

test('handles empty string', () => {
  assert.strictEqual(escapeHtml(''), '');
});

test('passes through safe text unchanged', () => {
  assert.strictEqual(escapeHtml('normal text 123'), 'normal text 123');
});

test('coerces numbers to string', () => {
  assert.strictEqual(escapeHtml(502), '502');
});

test('coerces null to string', () => {
  assert.strictEqual(escapeHtml(null), 'null');
});

test('coerces undefined to string', () => {
  assert.strictEqual(escapeHtml(undefined), 'undefined');
});

test('handles combined XSS vector', () => {
  assert.strictEqual(
    escapeHtml('"><img onerror=alert(1)>'),
    '&quot;&gt;&lt;img onerror=alert(1)&gt;'
  );
});

test('escapes all five characters in one string', () => {
  assert.strictEqual(
    escapeHtml('<a href="x" data-v=\'y\'>&</a>'),
    '&lt;a href=&quot;x&quot; data-v=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
  );
});

// --- injectBeforeHeadClose ---

const MARKER = '<!-- injected -->';

test('injects before </head>', () => {
  const html = '<html><head><title>T</title></head><body></body></html>';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.includes(`${MARKER}\n</head>`));
  assert.ok(result.includes('<title>T</title>'));
});

test('handles </head> with whitespace', () => {
  const html = '<head></head >';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.includes(`${MARKER}\n</head>`));
});

test('is case-insensitive for </head>', () => {
  const html = '<HEAD></HEAD>';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.includes(MARKER));
});

test('falls back to before <body> when no </head>', () => {
  const html = '<html><body><p>hi</p></body></html>';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.includes(`${MARKER}\n<body>`));
});

test('handles <body with attributes>', () => {
  const html = '<html><body class="dark"><p>hi</p></body></html>';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.includes(`${MARKER}\n<body class="dark">`));
});

test('prepends when no head or body', () => {
  const html = '<p>just a paragraph</p>';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.startsWith(`${MARKER}\n`));
});

test('preserves original content', () => {
  const html = '<html><head></head><body><div>content</div></body></html>';
  const result = injectBeforeHeadClose(html, MARKER);
  assert.ok(result.includes('<div>content</div>'));
  assert.ok(result.includes(MARKER));
});

console.log(`html tests OK (${passed} passed)`);
