const uploadInjectionScript = `
      (function() {
        if (window.__t3MobileObserverAttached) return;
        window.__t3MobileObserverAttached = true;

        function getComposerTarget() {
          var selectors = [
            '[data-chat-composer-form] textarea',
            '[data-chat-composer-form] [contenteditable="true"]',
            '[role="textbox"]',
            'textarea',
            '[contenteditable="true"]'
          ];
          for (var i = 0; i < selectors.length; i++) {
            var node = document.querySelector(selectors[i]);
            if (node) return node;
          }
          return null;
        }

        function getFileInput() {
          var fi = document.getElementById('t3-file-input');
          if (fi && fi.parentNode) return fi;
          if (fi) fi.remove();
          fi = document.createElement('input');
          fi.type = 'file';
          fi.accept = 'image/*';
          fi.style.display = 'none';
          fi.id = 't3-file-input';
          fi.addEventListener('change', handleFile);
          document.body.appendChild(fi);
          return fi;
        }

        function handleFile(e) {
          var file = e.target.files[0];
          if (!file) return;
          var dt = new DataTransfer();
          dt.items.add(file);
          var target = getComposerTarget();
          if (target) {
            target.focus();
            target.dispatchEvent(new ClipboardEvent('paste', {
              bubbles: true, cancelable: true, clipboardData: dt
            }));
          }
          e.target.value = '';
        }

        function findAnchorButton() {
          var footer = document.querySelector('[data-chat-composer-footer]');
          if (footer) {
            var buttons = footer.querySelectorAll('button');
            for (var i = buttons.length - 1; i >= 0; i--) {
              if (buttons[i].querySelectorAll('circle').length === 3) return buttons[i];
            }
            if (buttons.length) return buttons[buttons.length - 1];
          }
          var composer = document.querySelector('[data-chat-composer-form]');
          if (composer) {
            var composerButtons = composer.querySelectorAll('button');
            if (composerButtons.length) return composerButtons[composerButtons.length - 1];
          }
          return null;
        }

        function getFallbackContainer() {
          var composer = document.querySelector('[data-chat-composer-form]');
          if (!composer) return null;
          var container = document.getElementById('t3-mobile-actions');
          if (container && container.parentNode === composer) return container;
          if (container) container.remove();
          container = document.createElement('div');
          container.id = 't3-mobile-actions';
          container.style.display = 'flex';
          container.style.justifyContent = 'flex-end';
          container.style.marginTop = '8px';
          composer.appendChild(container);
          return container;
        }

        function ensureButton() {
          var anchor = findAnchorButton();
          var existing = document.getElementById('t3-img-btn');
          var fallback = getFallbackContainer();
          if (anchor && anchor.parentNode) {
            if (existing && existing.parentNode === anchor.parentNode) return true;
            if (existing) existing.remove();
          } else if (fallback) {
            if (existing && existing.parentNode === fallback) return true;
            if (existing) existing.remove();
          } else {
            return false;
          }
          var btn = document.createElement('button');
          btn.id = 't3-img-btn';
          btn.type = 'button';
          btn.title = 'Add image';
          btn.setAttribute('aria-label', 'Add image');
          btn.className = anchor ? anchor.className : '';
          if (!anchor) {
            btn.style.minWidth = '40px';
            btn.style.minHeight = '40px';
            btn.style.borderRadius = '12px';
            btn.style.border = '1px solid rgba(148, 163, 184, 0.25)';
            btn.style.background = 'transparent';
            btn.style.color = 'inherit';
            btn.style.display = 'inline-flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
          }
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
          btn.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            getFileInput().click();
          });
          if (anchor && anchor.parentNode) {
            anchor.parentNode.insertBefore(btn, anchor.nextSibling);
          } else {
            fallback.appendChild(btn);
          }
          return true;
        }

        function init() {
          ensureButton();
          var observerTicking = false;
          new MutationObserver(function() {
            if (observerTicking) return;
            observerTicking = true;
            requestAnimationFrame(function() {
              observerTicking = false;
              ensureButton();
            });
          }).observe(document.body, { childList: true, subtree: true });
        }

        if (document.body) {
          init();
        } else {
          document.addEventListener('DOMContentLoaded', init);
        }
      })();
`;

module.exports = { uploadInjectionScript };
