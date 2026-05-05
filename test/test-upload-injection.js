const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { uploadInjectionScript } = require('../lib/upload-injection');

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`FAIL: ${name}`);
    console.error(`  ${e.stack || e.message}`);
    process.exit(1);
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.id = '';
    this.type = '';
    this.title = '';
    this.className = '';
    this.accept = '';
    this.files = [];
    this.value = '';
    this.innerHTML = '';
    this.focused = false;
    this.clicked = false;
  }

  appendChild(child) {
    if (child.parentNode) child.remove();
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(child, referenceNode) {
    if (child.parentNode) child.remove();
    child.parentNode = this;
    const index = this.children.indexOf(referenceNode);
    if (index === -1) {
      this.children.push(child);
    } else {
      this.children.splice(index, 0, child);
    }
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    if (index !== -1) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
  }

  getAttribute(name) {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    return Object.prototype.hasOwnProperty.call(this.attributes, name)
      ? this.attributes[name]
      : null;
  }

  addEventListener(type, listener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  dispatchEvent(event) {
    event.target = event.target || this;
    const listeners = this.listeners[event.type] || [];
    for (const listener of listeners) {
      listener(event);
    }
    return true;
  }

  click() {
    this.clicked = true;
    this.dispatchEvent({
      type: 'click',
      preventDefault() {},
      stopPropagation() {},
    });
  }

  focus() {
    this.focused = true;
  }

  querySelector(selector) {
    return querySelectorFrom(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAllFrom(this, selector);
  }
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement('body');
    this.eventListeners = {};
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  getElementById(id) {
    return walk(this.body).find((node) => node.id === id) || null;
  }

  querySelector(selector) {
    return querySelectorFrom(this.body, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAllFrom(this.body, selector);
  }

  addEventListener(type, listener) {
    this.eventListeners[type] = listener;
  }
}

function walk(root) {
  const nodes = [];
  const visit = (node) => {
    nodes.push(node);
    for (const child of node.children) visit(child);
  };
  visit(root);
  return nodes;
}

function querySelectorFrom(root, selector) {
  return querySelectorAllFrom(root, selector)[0] || null;
}

function querySelectorAllFrom(root, selector) {
  const parts = selector.trim().split(/\s+/);
  return walk(root).filter((node) => matchesSelectorChain(node, parts));
}

function matchesSelectorChain(node, parts) {
  if (!matchesSimpleSelector(node, parts[parts.length - 1])) return false;
  let ancestor = node.parentNode;
  for (let i = parts.length - 2; i >= 0; i--) {
    while (ancestor && !matchesSimpleSelector(ancestor, parts[i])) {
      ancestor = ancestor.parentNode;
    }
    if (!ancestor) return false;
    ancestor = ancestor.parentNode;
  }
  return true;
}

function matchesSimpleSelector(node, selector) {
  const attrMatch = selector.match(/^\[([^=\]]+)(?:="([^"]+)")?\]$/);
  if (attrMatch) {
    const actual = node.getAttribute(attrMatch[1]);
    return attrMatch[2] === undefined ? actual !== null : actual === attrMatch[2];
  }
  return node.tagName.toLowerCase() === selector.toLowerCase();
}

function createContext(document) {
  const clipboardEvents = [];
  return {
    context: {
      document,
      window: {},
      console,
      requestAnimationFrame: (fn) => fn(),
      MutationObserver: class {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {}
      },
      DataTransfer: class {
        constructor() {
          this.items = {
            values: [],
            add: (file) => this.items.values.push(file),
          };
        }
      },
      ClipboardEvent: class {
        constructor(type, options) {
          this.type = type;
          this.clipboardData = options.clipboardData;
          this.bubbles = options.bubbles;
          this.cancelable = options.cancelable;
          clipboardEvents.push(this);
        }
      },
    },
    clipboardEvents,
  };
}

function runUploadScript(document) {
  const { context, clipboardEvents } = createContext(document);
  vm.runInNewContext(uploadInjectionScript, context);
  return { context, clipboardEvents };
}

function buildComposer({ withFooterAnchor = true } = {}) {
  const document = new FakeDocument();
  const form = document.createElement('form');
  form.setAttribute('data-chat-composer-form', '');
  const textarea = document.createElement('textarea');
  form.appendChild(textarea);

  if (withFooterAnchor) {
    const footer = document.createElement('div');
    footer.setAttribute('data-chat-composer-footer', '');
    const anchor = document.createElement('button');
    anchor.className = 'composer-button';
    anchor.appendChild(document.createElement('circle'));
    anchor.appendChild(document.createElement('circle'));
    anchor.appendChild(document.createElement('circle'));
    footer.appendChild(anchor);
    form.appendChild(footer);
  }

  document.body.appendChild(form);
  return { document, form, textarea };
}

test('proxy upload injection places image button next to composer footer action', () => {
  const { document } = buildComposer({ withFooterAnchor: true });
  runUploadScript(document);

  const button = document.getElementById('t3-img-btn');
  assert.ok(button, 'expected injected image button');
  assert.strictEqual(button.getAttribute('aria-label'), 'Add image');
  assert.strictEqual(button.parentNode.getAttribute('data-chat-composer-footer'), '');
  assert.strictEqual(button.parentNode.children.indexOf(button), 1);
});

test('proxy upload button creates hidden image file input on click', () => {
  const { document } = buildComposer({ withFooterAnchor: true });
  runUploadScript(document);

  document.getElementById('t3-img-btn').click();
  const input = document.getElementById('t3-file-input');
  assert.ok(input, 'expected hidden file input');
  assert.strictEqual(input.type, 'file');
  assert.strictEqual(input.accept, 'image/*');
  assert.strictEqual(input.style.display, 'none');
  assert.strictEqual(input.clicked, true);
});

test('proxy upload change dispatches paste event into composer target', () => {
  const { document, textarea } = buildComposer({ withFooterAnchor: true });
  const { clipboardEvents } = runUploadScript(document);

  document.getElementById('t3-img-btn').click();
  const input = document.getElementById('t3-file-input');
  input.files = [{ name: 'photo.png', type: 'image/png' }];
  input.dispatchEvent({ type: 'change', target: input });

  assert.strictEqual(textarea.focused, true);
  assert.strictEqual(input.value, '');
  assert.strictEqual(clipboardEvents.length, 1);
  assert.strictEqual(clipboardEvents[0].type, 'paste');
  assert.strictEqual(clipboardEvents[0].clipboardData.items.values[0].name, 'photo.png');
});

test('proxy upload injection falls back when composer footer is unavailable', () => {
  const { document, form } = buildComposer({ withFooterAnchor: false });
  runUploadScript(document);

  const fallback = document.getElementById('t3-mobile-actions');
  const button = document.getElementById('t3-img-btn');
  assert.ok(fallback, 'expected fallback action container');
  assert.ok(button, 'expected injected fallback button');
  assert.strictEqual(fallback.parentNode, form);
  assert.strictEqual(button.parentNode, fallback);
});

test('Android WebView upload injection still contains core reliability markers', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'apk', 'app', 'src', 'main', 'java', 'com', 't3code', 'app', 'MainActivity.java'),
    'utf8',
  );

  for (const marker of [
    'data-chat-composer-form',
    'data-chat-composer-footer',
    't3-file-input',
    't3-img-btn',
    't3-mobile-actions',
    'ClipboardEvent',
    'MutationObserver',
    'Using fallback upload button placement',
  ]) {
    assert.ok(source.includes(marker), `missing Android upload marker: ${marker}`);
  }
});

console.log(`upload injection tests OK (${passed} passed)`);
