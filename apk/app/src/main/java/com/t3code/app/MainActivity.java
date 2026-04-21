package com.t3code.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.Locale;

public class MainActivity extends Activity {

    private static final String PREFS = "t3code_prefs";
    private static final String KEY_URL = "server_url";
    private static final int FILE_PICKER_REQUEST = 1001;
    private static final int AUDIO_PERMISSION_REQUEST = 1002;
    private static final long LOAD_TIMEOUT_MS = 10000;

    private WebView webView;
    private String serverUrl;
    private String lastLoadedUrl = "Not loaded yet";
    private String lastErrorMessage = "No errors yet";
    private String lastSslWarning = "No certificate warnings";

    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingPermissionRequest;
    private final Handler uiHandler = new Handler(Looper.getMainLooper());
    private Runnable loadTimeoutRunnable;

    private ProgressBar loadingBar;
    private LinearLayout errorOverlay;
    private TextView errorTitleView;
    private TextView errorMessageView;
    private Button menuButton;

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
            showUrlInput(null, "Paste either the base URL or the full pairing link. The app will keep only the base URL.");
        } else {
            openServer(serverUrl, false, true);
        }
    }

    private void showUrlInput(String initialValue, String statusMessage) {
        disposeCurrentWebView();

        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(Color.parseColor("#161616"));

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.parseColor("#161616"));
        layout.setPadding(dp(24), dp(72), dp(24), dp(24));
        scrollView.addView(layout, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        TextView title = new TextView(this);
        title.setText("T3 Code Mobile");
        title.setTextColor(Color.parseColor("#8B7BFF"));
        title.setTextSize(30);
        title.setPadding(0, 0, 0, dp(10));
        layout.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("Connect to your T3 Code desktop app over Tailscale or a trusted local network.");
        subtitle.setTextColor(Color.parseColor("#E5E7EB"));
        subtitle.setTextSize(16);
        subtitle.setPadding(0, 0, 0, dp(18));
        layout.addView(subtitle);

        if (statusMessage != null && !statusMessage.isEmpty()) {
            TextView status = new TextView(this);
            status.setText(statusMessage);
            status.setTextColor(Color.parseColor("#9CA3AF"));
            status.setTextSize(13);
            status.setBackgroundColor(Color.parseColor("#1F2937"));
            status.setPadding(dp(14), dp(12), dp(14), dp(12));
            LinearLayout.LayoutParams statusParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            statusParams.bottomMargin = dp(18);
            status.setLayoutParams(statusParams);
            layout.addView(status);
        }

        EditText input = new EditText(this);
        input.setHint("http://your-t3-host:3773");
        input.setTextColor(Color.WHITE);
        input.setHintTextColor(Color.parseColor("#6B7280"));
        input.setBackgroundColor(Color.parseColor("#2A2A2A"));
        input.setPadding(dp(16), dp(16), dp(16), dp(16));
        input.setTextSize(16);
        if (initialValue != null && !initialValue.isEmpty()) {
            input.setText(initialValue);
            input.setSelection(input.getText().length());
        }
        layout.addView(input);

        TextView helper = new TextView(this);
        helper.setText("Examples: http://your-t3-host:3773 or https://your-t3-host:3780/pair#token=...");
        helper.setTextColor(Color.parseColor("#9CA3AF"));
        helper.setTextSize(12);
        helper.setPadding(0, dp(12), 0, 0);
        layout.addView(helper);

        TextView inputError = new TextView(this);
        inputError.setTextColor(Color.parseColor("#FCA5A5"));
        inputError.setTextSize(13);
        inputError.setPadding(0, dp(12), 0, 0);
        inputError.setVisibility(View.GONE);
        layout.addView(inputError);

        Button connectButton = buildPrimaryButton("Connect");
        LinearLayout.LayoutParams connectParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        connectParams.topMargin = dp(24);
        connectButton.setLayoutParams(connectParams);
        connectButton.setOnClickListener(v -> {
            String normalizedUrl = normalizeServerUrl(input.getText().toString());
            if (normalizedUrl == null) {
                inputError.setText("Enter a valid http:// or https:// address, for example http://your-t3-host:3773");
                inputError.setVisibility(View.VISIBLE);
                return;
            }

            inputError.setVisibility(View.GONE);
            openServer(normalizedUrl, true, false);
        });
        layout.addView(connectButton);

        if (serverUrl != null) {
            Button clearButton = buildSecondaryButton("Forget saved server");
            LinearLayout.LayoutParams clearParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            clearParams.topMargin = dp(12);
            clearButton.setLayoutParams(clearParams);
            clearButton.setOnClickListener(v -> {
                clearSavedServerUrl();
                serverUrl = null;
                input.setText("");
                inputError.setVisibility(View.GONE);
                showUrlInput(null, "Saved server removed. Enter a new base URL when you are ready.");
            });
            layout.addView(clearButton);
        }

        TextView footer = new TextView(this);
        footer.setText("The app saves only the base URL. If you paste the full pairing link, the token stays in T3 Code and is not stored here. Use HTTPS when possible and keep HTTP to Tailscale or trusted local networks.");
        footer.setTextColor(Color.parseColor("#6B7280"));
        footer.setTextSize(12);
        footer.setPadding(0, dp(26), 0, 0);
        layout.addView(footer);

        setContentView(scrollView);
    }

    private void loadWebView(String url) {
        disposeCurrentWebView();

        serverUrl = url;
        lastErrorMessage = "No errors yet";
        lastSslWarning = "No certificate warnings";

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#161616"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#161616"));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(isHttpsUrl(url)
            ? WebSettings.MIXED_CONTENT_NEVER_ALLOW
            : WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        );
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setUserAgentString(settings.getUserAgentString() + " T3CodeMobile/1.2");
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri requestUri = request.getUrl();
                String scheme = requestUri.getScheme();
                if (scheme == null) {
                    return false;
                }

                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    if (isTrustedWebDestination(requestUri)) {
                        return false;
                    }

                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, requestUri));
                        return true;
                    } catch (ActivityNotFoundException ignored) {
                        return false;
                    }
                }

                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, requestUri));
                    return true;
                } catch (ActivityNotFoundException ignored) {
                    return false;
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                lastSslWarning = buildSslWarningMessage(error);
                lastErrorMessage = "Connection blocked because the server certificate was invalid.";
                handler.cancel();
                showPageError(
                    "Certificate warning",
                    lastSslWarning + "\n\nThe app blocks invalid certificates. Use a trusted certificate or HTTP only on Tailscale or another trusted private network."
                );
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                cancelLoadTimeout();
                lastLoadedUrl = url;
                hideErrorOverlay();
                injectImageButton();
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                cancelLoadTimeout();
                lastErrorMessage = description != null ? description : "Unknown network error";
                showPageError("Connection problem", lastErrorMessage);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame()) {
                    cancelLoadTimeout();
                    String description = error != null && error.getDescription() != null
                        ? error.getDescription().toString()
                        : "Unknown network error";
                    lastErrorMessage = description;
                    showPageError("Connection problem", description);
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                super.onReceivedHttpError(view, request, errorResponse);
                if (request != null && request.isForMainFrame() && errorResponse != null) {
                    cancelLoadTimeout();
                    lastErrorMessage = "HTTP " + errorResponse.getStatusCode();
                    showPageError(
                        "Server responded with an error",
                        "HTTP " + errorResponse.getStatusCode() + " while loading " + request.getUrl()
                    );
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                handlePermissionRequest(request);
            }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (loadingBar == null) {
                    return;
                }

                loadingBar.setProgress(newProgress);
                loadingBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) {
                    fileCallback.onReceiveValue(null);
                }
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

        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        loadingBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        loadingBar.setMax(100);
        loadingBar.getProgressDrawable().setColorFilter(Color.parseColor("#6C63FF"), PorterDuff.Mode.SRC_IN);
        FrameLayout.LayoutParams loadingParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            dp(3)
        );
        loadingParams.gravity = Gravity.TOP;
        root.addView(loadingBar, loadingParams);

        menuButton = buildOverlayButton("Menu");
        FrameLayout.LayoutParams menuParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        );
        menuParams.gravity = Gravity.TOP | Gravity.END;
        menuParams.topMargin = dp(16);
        menuParams.rightMargin = dp(16);
        menuButton.setOnClickListener(v -> showMenuDialog());
        root.addView(menuButton, menuParams);

        errorOverlay = buildErrorOverlay();
        root.addView(errorOverlay);

        setContentView(root);
        loadingBar.setVisibility(View.VISIBLE);
        scheduleLoadTimeout(url);
        webView.loadUrl(url);
    }

    private LinearLayout buildErrorOverlay() {
        LinearLayout overlay = new LinearLayout(this);
        overlay.setOrientation(LinearLayout.VERTICAL);
        overlay.setGravity(Gravity.CENTER);
        overlay.setBackgroundColor(Color.parseColor("#D9161616"));
        overlay.setPadding(dp(24), dp(24), dp(24), dp(24));
        overlay.setVisibility(View.GONE);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundColor(Color.parseColor("#1F2937"));
        card.setPadding(dp(20), dp(20), dp(20), dp(20));
        FrameLayout.LayoutParams cardParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        );
        cardParams.gravity = Gravity.CENTER;
        overlay.addView(card, cardParams);

        errorTitleView = new TextView(this);
        errorTitleView.setTextColor(Color.WHITE);
        errorTitleView.setTextSize(20);
        card.addView(errorTitleView);

        errorMessageView = new TextView(this);
        errorMessageView.setTextColor(Color.parseColor("#D1D5DB"));
        errorMessageView.setTextSize(14);
        errorMessageView.setPadding(0, dp(12), 0, dp(18));
        card.addView(errorMessageView);

        Button retryButton = buildPrimaryButton("Retry");
        retryButton.setOnClickListener(v -> {
            hideErrorOverlay();
            if (webView != null) {
                loadingBar.setVisibility(View.VISIBLE);
                webView.reload();
            }
        });
        card.addView(retryButton);

        Button changeServerButton = buildSecondaryButton("Change server");
        LinearLayout.LayoutParams changeParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        changeParams.topMargin = dp(10);
        changeServerButton.setLayoutParams(changeParams);
        changeServerButton.setOnClickListener(v -> showUrlInput(serverUrl, "Update the server URL or paste a fresh pairing link."));
        card.addView(changeServerButton);

        FrameLayout.LayoutParams overlayParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        );
        overlay.setLayoutParams(overlayParams);
        return overlay;
    }

    private void showPageError(String title, String message) {
        if (errorOverlay == null) {
            return;
        }

        runOnUiThread(() -> {
            cancelLoadTimeout();
            errorTitleView.setText(title);
            errorMessageView.setText(message);
            errorOverlay.setVisibility(View.VISIBLE);
            if (loadingBar != null) {
                loadingBar.setVisibility(View.GONE);
            }
        });
    }

    private void hideErrorOverlay() {
        if (errorOverlay != null) {
            errorOverlay.setVisibility(View.GONE);
        }
    }

    private void showMenuDialog() {
        String[] options = new String[] {
            "Reload current page",
            "Connection info",
            "Change server"
        };

        new AlertDialog.Builder(this)
            .setTitle("T3 Code Mobile")
            .setItems(options, (dialog, which) -> {
                if (which == 0 && webView != null) {
                    loadingBar.setVisibility(View.VISIBLE);
                    scheduleLoadTimeout(serverUrl);
                    webView.reload();
                } else if (which == 1) {
                    showConnectionInfoDialog();
                } else if (which == 2) {
                    showUrlInput(serverUrl, "You can switch servers without clearing app data.");
                }
            })
            .setNegativeButton("Close", null)
            .show();
    }

    private void showConnectionInfoDialog() {
        StringBuilder info = new StringBuilder();
        info.append("Base URL: ").append(serverUrl != null ? serverUrl : "Not set");
        info.append("\n\nLast page: ").append(lastLoadedUrl);
        info.append("\n\nLast error: ").append(lastErrorMessage);
        info.append("\n\nSSL status: ").append(lastSslWarning);
        if (serverUrl != null && isCleartextUrl(serverUrl)) {
            info.append("\n\nTransport: HTTP. Continue only on Tailscale or another trusted private network.");
        }
        info.append("\n\nNavigation policy: Only the configured server stays inside the app. Other links open externally.");

        new AlertDialog.Builder(this)
            .setTitle("Connection info")
            .setMessage(info.toString())
            .setPositiveButton("Close", null)
            .setNeutralButton("Change server", (dialog, which) ->
                showUrlInput(serverUrl, "Update the server URL or paste a fresh pairing link.")
            )
            .show();
    }

    private void openServer(String normalizedUrl, boolean persistSelection, boolean showInputIfDeclined) {
        if (isCleartextUrl(normalizedUrl)) {
            showCleartextWarningDialog(normalizedUrl, persistSelection, showInputIfDeclined);
            return;
        }

        continueToServer(normalizedUrl, persistSelection);
    }

    private void continueToServer(String normalizedUrl, boolean persistSelection) {
        if (persistSelection) {
            saveServerUrl(normalizedUrl);
        }
        serverUrl = normalizedUrl;
        loadWebView(normalizedUrl);
    }

    private void showCleartextWarningDialog(String normalizedUrl, boolean persistSelection, boolean showInputIfDeclined) {
        String host = extractHost(normalizedUrl);
        StringBuilder warning = new StringBuilder();
        warning.append("You are about to open T3 Code over HTTP");
        if (host != null) {
            warning.append(" (").append(host).append(")");
        }
        warning.append(".\n\nTraffic over HTTP is not encrypted.");
        if (isLikelyPrivateHost(host)) {
            warning.append(" Continue only if this server is reachable through Tailscale or another network you control.");
        } else {
            warning.append(" This host does not look like a private network address. Prefer HTTPS before continuing.");
        }

        new AlertDialog.Builder(this)
            .setTitle("Cleartext warning")
            .setMessage(warning.toString())
            .setPositiveButton("Continue on HTTP", (dialog, which) ->
                continueToServer(normalizedUrl, persistSelection)
            )
            .setNegativeButton(showInputIfDeclined ? "Change server" : "Cancel", (dialog, which) -> {
                if (showInputIfDeclined) {
                    showUrlInput(normalizedUrl, "HTTP connection was not started. Switch to HTTPS if possible.");
                }
            })
            .show();
    }

    private void handlePermissionRequest(PermissionRequest request) {
        runOnUiThread(() -> {
            boolean wantsAudio = false;
            for (String resource : request.getResources()) {
                if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                    wantsAudio = true;
                    break;
                }
            }

            if (!wantsAudio) {
                request.deny();
                return;
            }

            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
                return;
            }

            if (pendingPermissionRequest != null) {
                pendingPermissionRequest.deny();
            }

            pendingPermissionRequest = request;
            requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, AUDIO_PERMISSION_REQUEST);
        });
    }

    private String normalizeServerUrl(String rawInput) {
        if (rawInput == null) {
            return null;
        }

        String candidate = rawInput.trim();
        if (candidate.isEmpty()) {
            return null;
        }

        if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
            candidate = "http://" + candidate;
        }

        Uri parsed = Uri.parse(candidate);
        String scheme = parsed.getScheme();
        String host = parsed.getHost();
        if (scheme == null || host == null) {
            return null;
        }

        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            return null;
        }

        Uri.Builder builder = new Uri.Builder()
            .scheme(scheme.toLowerCase())
            .encodedAuthority(host);

        int port = parsed.getPort();
        if (port > 0) {
            builder.encodedAuthority(host + ":" + port);
        }

        return builder.build().toString();
    }

    private boolean isHttpsUrl(String url) {
        if (url == null) {
            return false;
        }

        Uri parsed = Uri.parse(url);
        return "https".equalsIgnoreCase(parsed.getScheme());
    }

    private boolean isCleartextUrl(String url) {
        return url != null && !isHttpsUrl(url);
    }

    private boolean isLikelyPrivateHost(String host) {
        if (host == null) {
            return false;
        }

        String lowerHost = host.toLowerCase(Locale.US);
        if ("localhost".equals(lowerHost)
            || "10.0.2.2".equals(lowerHost)
            || lowerHost.endsWith(".ts.net")
            || lowerHost.endsWith(".local")
            || lowerHost.endsWith(".lan")
            || lowerHost.endsWith(".internal")
            || lowerHost.endsWith(".home.arpa")
        ) {
            return true;
        }

        return isPrivateIpv4(lowerHost);
    }

    private void saveServerUrl(String url) {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        prefs.edit().putString(KEY_URL, url).apply();
    }

    private void clearSavedServerUrl() {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        prefs.edit().remove(KEY_URL).apply();
    }

    private String extractHost(String url) {
        if (url == null) {
            return null;
        }

        Uri parsed = Uri.parse(url);
        return parsed.getHost();
    }

    private boolean isPrivateIpv4(String host) {
        String[] parts = host.split("\\.");
        if (parts.length != 4) {
            return false;
        }

        try {
            int first = Integer.parseInt(parts[0]);
            int second = Integer.parseInt(parts[1]);

            if (first == 10 || first == 127) {
                return true;
            }
            if (first == 192 && second == 168) {
                return true;
            }
            if (first == 172 && second >= 16 && second <= 31) {
                return true;
            }
            if (first == 169 && second == 254) {
                return true;
            }
            if (first == 100 && second >= 64 && second <= 127) {
                return true;
            }
        } catch (NumberFormatException ignored) {
            return false;
        }

        return false;
    }

    private boolean isTrustedWebDestination(Uri requestUri) {
        if (serverUrl == null || requestUri == null) {
            return false;
        }

        Uri baseUri = Uri.parse(serverUrl);
        String baseHost = baseUri.getHost();
        String requestHost = requestUri.getHost();
        if (baseHost == null || requestHost == null || !baseHost.equalsIgnoreCase(requestHost)) {
            return false;
        }

        return resolvePort(baseUri) == resolvePort(requestUri);
    }

    private int resolvePort(Uri uri) {
        int port = uri.getPort();
        if (port > 0) {
            return port;
        }

        if ("https".equalsIgnoreCase(uri.getScheme())) {
            return 443;
        }

        return 80;
    }

    private void scheduleLoadTimeout(String url) {
        cancelLoadTimeout();
        loadTimeoutRunnable = () -> {
            if (webView == null || errorOverlay == null) {
                return;
            }

            if (errorOverlay.getVisibility() == View.VISIBLE) {
                return;
            }

            lastErrorMessage = "The page did not finish loading.";
            showPageError(
                "Connection timed out or was blocked",
                "The page at " + url + " did not finish loading in time. If you are using HTTPS, verify the certificate. If you are using HTTP, keep it on Tailscale or another trusted private network."
            );
        };
        uiHandler.postDelayed(loadTimeoutRunnable, LOAD_TIMEOUT_MS);
    }

    private void cancelLoadTimeout() {
        if (loadTimeoutRunnable != null) {
            uiHandler.removeCallbacks(loadTimeoutRunnable);
            loadTimeoutRunnable = null;
        }
    }

    private void disposeCurrentWebView() {
        cancelLoadTimeout();
        if (webView == null) {
            return;
        }

        webView.stopLoading();
        webView.setWebChromeClient(null);
        webView.setWebViewClient(null);
        webView.loadUrl("about:blank");
        ViewGroup parent = (ViewGroup) webView.getParent();
        if (parent != null) {
            parent.removeView(webView);
        }
        webView.removeAllViews();
        webView.destroy();
        webView = null;
    }

    private String buildSslWarningMessage(SslError error) {
        StringBuilder builder = new StringBuilder();
        builder.append("The server certificate could not be verified");

        String host = extractHost(error.getUrl());
        if (host != null) {
            builder.append(" for ").append(host);
        }
        builder.append(".");

        if (error.hasError(SslError.SSL_UNTRUSTED)) {
            builder.append("\n- The certificate is not signed by a trusted authority.");
        }
        if (error.hasError(SslError.SSL_EXPIRED)) {
            builder.append("\n- The certificate has expired.");
        }
        if (error.hasError(SslError.SSL_IDMISMATCH)) {
            builder.append("\n- The certificate hostname does not match the server.");
        }
        if (error.hasError(SslError.SSL_NOTYETVALID)) {
            builder.append("\n- The certificate is not valid yet.");
        }

        return builder.toString();
    }

    private Button buildPrimaryButton(String text) {
        Button button = new Button(this);
        button.setText(text);
        button.setTextColor(Color.WHITE);
        button.setTextSize(16);
        button.setBackgroundColor(Color.parseColor("#6C63FF"));
        return button;
    }

    private Button buildSecondaryButton(String text) {
        Button button = new Button(this);
        button.setText(text);
        button.setTextColor(Color.parseColor("#E5E7EB"));
        button.setTextSize(15);
        button.setBackgroundColor(Color.parseColor("#2A2A2A"));
        return button;
    }

    private Button buildOverlayButton(String text) {
        Button button = new Button(this);
        button.setText(text);
        button.setTextColor(Color.WHITE);
        button.setTextSize(13);
        button.setBackgroundColor(Color.parseColor("#CC111827"));
        button.setPadding(dp(12), dp(8), dp(12), dp(8));
        return button;
    }

    private int dp(int value) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(value * density);
    }

    private void injectImageButton() {
        String js = "(function() {" +
            "if (window.__t3MobileObserverAttached) return;" +
            "window.__t3MobileObserverAttached = true;" +

            "function getComposerTarget() {" +
            "  var selectors = [" +
            "    '[data-chat-composer-form] textarea'," +
            "    '[data-chat-composer-form] [contenteditable=\"true\"]'," +
            "    '[role=\"textbox\"]'," +
            "    'textarea'," +
            "    '[contenteditable=\"true\"]'" +
            "  ];" +
            "  for (var i = 0; i < selectors.length; i++) {" +
            "    var node = document.querySelector(selectors[i]);" +
            "    if (node) return node;" +
            "  }" +
            "  return null;" +
            "}" +

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

            "function handleFile(e) {" +
            "  var file = e.target.files[0];" +
            "  if (!file) return;" +
            "  var dt = new DataTransfer();" +
            "  dt.items.add(file);" +
            "  var target = getComposerTarget();" +
            "  if (target) {" +
            "    target.focus();" +
            "    target.dispatchEvent(new ClipboardEvent('paste', { bubbles:true, cancelable:true, clipboardData:dt }));" +
            "  }" +
            "  e.target.value = '';" +
            "}" +

            "function findAnchorButton() {" +
            "  var footer = document.querySelector('[data-chat-composer-footer]');" +
            "  if (footer) {" +
            "    var buttons = footer.querySelectorAll('button');" +
            "    for (var i = buttons.length - 1; i >= 0; i--) {" +
            "      if (buttons[i].querySelectorAll('circle').length === 3) return buttons[i];" +
            "    }" +
            "    if (buttons.length) return buttons[buttons.length - 1];" +
            "  }" +
            "  var composer = document.querySelector('[data-chat-composer-form]');" +
            "  if (composer) {" +
            "    var composerButtons = composer.querySelectorAll('button');" +
            "    if (composerButtons.length) return composerButtons[composerButtons.length - 1];" +
            "  }" +
            "  return null;" +
            "}" +

            "function getFallbackContainer() {" +
            "  var composer = document.querySelector('[data-chat-composer-form]');" +
            "  if (!composer) return null;" +
            "  var container = document.getElementById('t3-mobile-actions');" +
            "  if (container && container.parentNode === composer) return container;" +
            "  if (container) container.remove();" +
            "  container = document.createElement('div');" +
            "  container.id = 't3-mobile-actions';" +
            "  container.style.display = 'flex';" +
            "  container.style.justifyContent = 'flex-end';" +
            "  container.style.marginTop = '8px';" +
            "  composer.appendChild(container);" +
            "  return container;" +
            "}" +

            "function ensureButton() {" +
            "  var anchor = findAnchorButton();" +
            "  var existing = document.getElementById('t3-img-btn');" +
            "  var fallback = getFallbackContainer();" +
            "  if (anchor && anchor.parentNode) {" +
            "    if (existing && existing.parentNode === anchor.parentNode) return true;" +
            "    if (existing) existing.remove();" +
            "  } else if (fallback) {" +
            "    if (existing && existing.parentNode === fallback) return true;" +
            "    if (existing) existing.remove();" +
            "  } else {" +
            "    console.warn('[T3 Mobile] Could not find a composer attachment target.');" +
            "    return false;" +
            "  }" +
            "  var btn = document.createElement('button');" +
            "  btn.id = 't3-img-btn';" +
            "  btn.type = 'button';" +
            "  btn.title = 'Add image';" +
            "  btn.setAttribute('aria-label', 'Add image');" +
            "  btn.className = anchor ? anchor.className : '';" +
            "  if (!anchor) {" +
            "    btn.style.minWidth = '40px';" +
            "    btn.style.minHeight = '40px';" +
            "    btn.style.borderRadius = '12px';" +
            "    btn.style.border = '1px solid rgba(148, 163, 184, 0.25)';" +
            "    btn.style.background = 'transparent';" +
            "    btn.style.color = 'inherit';" +
            "    btn.style.display = 'inline-flex';" +
            "    btn.style.alignItems = 'center';" +
            "    btn.style.justifyContent = 'center';" +
            "  }" +
            "  btn.innerHTML = '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>';" +
            "  btn.addEventListener('click', function(ev) {" +
            "    ev.preventDefault();" +
            "    ev.stopPropagation();" +
            "    getFileInput().click();" +
            "  });" +
            "  if (anchor && anchor.parentNode) {" +
            "    anchor.parentNode.insertBefore(btn, anchor.nextSibling);" +
            "  } else {" +
            "    fallback.appendChild(btn);" +
            "    console.warn('[T3 Mobile] Using fallback upload button placement.');" +
            "  }" +
            "  return true;" +
            "}" +

            "ensureButton();" +
            "var observerTicking = false;" +
            "new MutationObserver(function() {" +
            "  if (observerTicking) return;" +
            "  observerTicking = true;" +
            "  requestAnimationFrame(function() {" +
            "    observerTicking = false;" +
            "    ensureButton();" +
            "  });" +
            "}).observe(document.body, { childList:true, subtree:true });" +
            "})();";

        if (webView != null) {
            webView.evaluateJavascript(js, null);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_PICKER_REQUEST) {
            if (fileCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    Uri uri = data.getData();
                    if (uri != null) {
                        results = new Uri[] { uri };
                    }
                }
                fileCallback.onReceiveValue(results);
                fileCallback = null;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == AUDIO_PERMISSION_REQUEST && pendingPermissionRequest != null) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            if (granted) {
                pendingPermissionRequest.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
            } else {
                pendingPermissionRequest.deny();
                lastErrorMessage = "Microphone permission was denied.";
            }
            pendingPermissionRequest = null;
        }

        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (pendingPermissionRequest != null) {
            pendingPermissionRequest.deny();
            pendingPermissionRequest = null;
        }

        cancelLoadTimeout();

        if (fileCallback != null) {
            fileCallback.onReceiveValue(null);
            fileCallback = null;
        }

        if (webView != null) {
            disposeCurrentWebView();
        }

        super.onDestroy();
    }
}
