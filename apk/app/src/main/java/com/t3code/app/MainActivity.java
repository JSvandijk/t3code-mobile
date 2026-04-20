package com.t3code.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {

    private WebView webView;
    private String serverUrl;
    private static final String PREFS = "t3code_prefs";
    private static final String KEY_URL = "server_url";
    private static final int FILE_PICKER_REQUEST = 1001;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().setStatusBarColor(Color.parseColor("#161616"));
        getWindow().setNavigationBarColor(Color.parseColor("#161616"));

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        serverUrl = prefs.getString(KEY_URL, null);

        if (serverUrl == null) {
            showUrlInput();
        } else {
            loadWebView(serverUrl);
        }
    }

    private void showUrlInput() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.parseColor("#161616"));
        layout.setPadding(60, 160, 60, 60);

        TextView title = new TextView(this);
        title.setText("T3 Code Mobile");
        title.setTextColor(Color.parseColor("#8B7BFF"));
        title.setTextSize(32);
        title.setPadding(0, 0, 0, 20);
        layout.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("Connect to your T3 Code desktop app over Tailscale or a trusted local network.");
        subtitle.setTextColor(Color.parseColor("#e0e0e0"));
        subtitle.setTextSize(16);
        subtitle.setPadding(0, 0, 0, 30);
        layout.addView(subtitle);

        EditText input = new EditText(this);
        input.setHint("http://your-t3-host:3773");
        input.setTextColor(Color.WHITE);
        input.setHintTextColor(Color.GRAY);
        input.setBackgroundColor(Color.parseColor("#2a2a2a"));
        input.setPadding(30, 30, 30, 30);
        input.setTextSize(16);
        layout.addView(input);

        TextView example = new TextView(this);
        example.setText("Example: http://your-t3-host:3773");
        example.setTextColor(Color.GRAY);
        example.setTextSize(12);
        example.setPadding(0, 16, 0, 0);
        layout.addView(example);

        Button btn = new Button(this);
        btn.setText("Connect");
        btn.setBackgroundColor(Color.parseColor("#6C63FF"));
        btn.setTextColor(Color.WHITE);
        btn.setTextSize(16);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.topMargin = 40;
        btn.setLayoutParams(params);
        btn.setOnClickListener(v -> {
            String url = input.getText().toString().trim();
            if (!url.isEmpty()) {
                if (!url.startsWith("http")) url = "http://" + url;
                SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
                prefs.edit().putString(KEY_URL, url).apply();
                serverUrl = url;
                loadWebView(url);
            }
        });
        layout.addView(btn);

        TextView reset = new TextView(this);
        reset.setText("The URL is saved. You can reset it later by clearing the app data.");
        reset.setTextColor(Color.GRAY);
        reset.setTextSize(12);
        reset.setPadding(0, 40, 0, 0);
        layout.addView(reset);

        setContentView(layout);
    }

    private void loadWebView(String url) {
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#161616"));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setAllowFileAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setUserAgentString(settings.getUserAgentString() + " T3CodeMobile/1.1");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectImageButton();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);

                Intent chooser = Intent.createChooser(intent, "Choose an image");
                startActivityForResult(chooser, FILE_PICKER_REQUEST);
                return true;
            }
        });

        setContentView(webView);
        webView.loadUrl(url);
    }

    private void injectImageButton() {
        String js = "(function() {" +
            "if (document.getElementById('t3-img-btn')) return;" +

            // Ensure file input exists (recreate if lost during SPA nav)
            "function getFileInput() {" +
            "  var fi = document.getElementById('t3-file-input');" +
            "  if (fi && fi.parentNode) return fi;" +
            "  if (fi) fi.remove();" +
            "  fi = document.createElement('input');" +
            "  fi.type = 'file';" +
            "  fi.accept = 'image/*';" +
            "  fi.style.display = 'none';" +
            "  fi.id = 't3-file-input';" +
            "  fi.addEventListener('change', handleFile);" +
            "  document.body.appendChild(fi);" +
            "  return fi;" +
            "}" +

            // Handle selected file - paste into chat
            "function handleFile(e) {" +
            "  var file = e.target.files[0];" +
            "  if (!file) return;" +
            "  var dt = new DataTransfer();" +
            "  dt.items.add(file);" +
            "  var target = document.querySelector('[data-chat-composer-form] textarea, [data-chat-composer-form] [contenteditable], [role=\"textbox\"]');" +
            "  if (!target) { var inputs = document.querySelectorAll('textarea, [contenteditable=\"true\"]'); target = inputs[inputs.length-1]; }" +
            "  if (target) {" +
            "    target.focus();" +
            "    target.dispatchEvent(new ClipboardEvent('paste', { bubbles:true, cancelable:true, clipboardData:dt }));" +
            "  }" +
            "  e.target.value = '';" +
            "}" +

            // Find ellipsis button in composer footer
            "function findEllipsisButton() {" +
            "  var footer = document.querySelector('[data-chat-composer-footer]');" +
            "  if (!footer) return null;" +
            "  var svgs = footer.querySelectorAll('svg');" +
            "  for (var i = 0; i < svgs.length; i++) {" +
            "    if (svgs[i].querySelectorAll('circle').length === 3) {" +
            "      return svgs[i].closest('button');" +
            "    }" +
            "  }" +
            "  return null;" +
            "}" +

            // Place the button next to ellipsis
            "function place() {" +
            "  var ellipsisBtn = findEllipsisButton();" +
            "  if (!ellipsisBtn) return false;" +
            "  var btn = document.createElement('button');" +
            "  btn.id = 't3-img-btn';" +
            "  btn.type = 'button';" +
            "  btn.title = 'Add image';" +
            "  btn.className = ellipsisBtn.className;" +
            "  btn.innerHTML = '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>';" +
            "  ellipsisBtn.parentNode.insertBefore(btn, ellipsisBtn.nextSibling);" +
            "  btn.addEventListener('click', function(e) {" +
            "    e.preventDefault(); e.stopPropagation();" +
            "    getFileInput().click();" +
            "  });" +
            "  return true;" +
            "}" +

            // Place now + permanent observer
            "place();" +
            "new MutationObserver(function() {" +
            "  if (!document.getElementById('t3-img-btn')) place();" +
            "}).observe(document.body, { childList:true, subtree:true });" +

            "})();";

        webView.evaluateJavascript(js, null);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_PICKER_REQUEST) {
            if (fileCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    Uri uri = data.getData();
                    if (uri != null) {
                        results = new Uri[]{uri};
                    }
                }
                fileCallback.onReceiveValue(results);
                fileCallback = null;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
