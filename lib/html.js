const HEAD_CLOSE_RE = /<\/head\s*>/i;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectBeforeHeadClose(html, markup) {
  if (HEAD_CLOSE_RE.test(html)) {
    return html.replace(HEAD_CLOSE_RE, `${markup}\n</head>`);
  }

  const bodyIndex = html.search(/<body[\s>]/i);
  if (bodyIndex !== -1) {
    return `${html.slice(0, bodyIndex)}${markup}\n${html.slice(bodyIndex)}`;
  }

  return `${markup}\n${html}`;
}

module.exports = { escapeHtml, injectBeforeHeadClose };
