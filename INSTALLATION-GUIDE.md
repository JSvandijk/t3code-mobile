# Installation Guide

This guide assumes you already use T3 Code on your main computer and want to access that same environment from an Android phone.

## Requirements

- A Windows, macOS, or Linux machine running T3 Code
- An Android phone
- Tailscale on both devices, or another trusted private network
- A pairing link created from the T3 Code desktop app

## Option A: Native Android App

### 1. Install Tailscale

On your main computer:

1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download).
2. Sign in.
3. Keep it running.

On your phone:

1. Install Tailscale from the Play Store.
2. Sign in with the same account.
3. Confirm both devices are visible in your Tailnet.

### 2. Prepare T3 Code

1. Install or open T3 Code on your main computer.
2. Go to `Settings` -> `Connections` -> `Create Link`.
3. Copy the base URL and pairing token from the generated link.

Example:

```text
http://your-t3-host:3773/pair#token=XXXXXX
```

What you need:

- Base URL: `http://your-t3-host:3773`
- Pairing token: the value after `token=`

### 3. Install The APK

1. Build `T3Code.apk` locally or download a release asset if one is available in the repository.
2. Open the APK on your Android phone.
3. Allow installation from unknown sources if Android asks.
4. Finish the install.

### 4. Connect And Pair

1. Open the app.
2. Enter the base URL from the desktop app, or paste the full pairing link and let the app keep only the base URL.
3. Tap `Connect`.
4. Complete the normal T3 Code pairing flow.
5. Enter the pairing token when prompted.

After pairing, the app remembers the base URL.
Use the in-app `Menu` button if you want to reload the session, inspect connection info, or change the saved server later.

## Option B: HTTPS PWA Proxy

Use this mode if you want an installable browser version instead of the native APK.

### 1. Prepare Certificates

Place the following files in the repo root, or point to them through environment variables:

- `key.pem`
- `cert.pem`

### 2. Configure The Proxy

Supported environment variables:

- `HTTPS_PORT`
- `T3_TARGET`
- `PUBLIC_URL`
- `SSL_KEY_PATH`
- `SSL_CERT_PATH`

See [.env.example](.env.example) for defaults.

### 3. Start The Proxy

```bash
npm install
npm start
```

Open the printed HTTPS URL from your phone and use your browser's "Add to Home Screen" or install action.

## Troubleshooting

### The app cannot connect

- Verify T3 Code is open on your main computer
- Verify Tailscale is running on both devices
- Verify the Tailscale hostname or private address is correct
- Verify the URL includes the port, usually `:3773`
- Use the in-app `Connection info` view from the `Menu` button for the latest error and URL details

### Pairing fails

- Create a fresh link from `Settings` -> `Connections` -> `Create Link`
- Tokens are usually single-use
- Make sure you enter the base URL first, not the full `/pair#token=...` link

### The photo button is missing

- Reload the page once
- Switch chats and back once
- If the upstream T3 Code DOM changed, update the selector logic in `MainActivity.java`

### The PWA shows certificate warnings

- Use a certificate trusted by your device, or import the cert if appropriate for your setup
- Confirm `PUBLIC_URL` matches the address you actually open from your phone

### The Android app blocks an HTTPS server

- The app now blocks invalid or mismatched TLS certificates instead of bypassing them
- Use a valid trusted certificate if you want HTTPS inside the app
- If you are on Tailscale or another trusted private network, HTTP may be simpler for self-hosted use
