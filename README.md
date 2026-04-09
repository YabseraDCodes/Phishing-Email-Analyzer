# Phishing Email Analyzer

Phishing Email Analyzer is a lightweight project that helps inspect suspicious email content using transparent heuristics. It includes:

- a standalone browser-based analyzer in `web/`
- a browser extension in `extension/`
- a shared analysis engine in `shared/analyzer.js`

## What it checks

The analyzer scores messages using visible rules such as:

- urgency or pressure language
- credential and password requests
- payment or invoice pressure
- suspicious attachment prompts
- shortened URLs
- sender and link domain mismatch
- suspicious sender domain patterns
- requests for sensitive data

This is not a replacement for enterprise mail security or sandboxing. It is a practical first-pass tool to help users pause before interacting with suspicious content.

## Run the web app

1. Open `web/index.html` in a browser.
2. Paste the sender, subject, and email body.
3. Optionally load a `.eml` file from the form.
4. Click `Analyze Email`.

## Load the browser extension

Chrome and other Chromium-based browsers:

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `extension` folder from this project.

Once loaded, the extension popup lets you:

- paste email content and analyze it
- scan the active tab to inspect visible email-like content

## Quick Chrome test

1. Open `chrome://extensions`.
2. Make sure `Phishing Email Analyzer` is enabled.
3. Pin the extension to the toolbar so it is easy to open while viewing mail.
4. Sign into one Gmail or Outlook account in Chrome.
5. From a different account, send the content from `test-assets/sample-phishing.eml` to the inbox you will inspect.
6. Open the suspicious message in Gmail or Outlook Web.
7. Click the extension icon.
8. Click `Scan Current Tab`.
9. Confirm that the extension extracts the sender, subject, and body, then review the risk score and findings.

If you want to test manual mode instead of tab scanning:

1. Open `web/index.html` in Chrome.
2. Click `Load file`.
3. Select `test-assets/sample-phishing.eml`.
4. Review the phishing score and extracted indicators.

## Safe test note

Use only your own accounts for testing. The included phishing sample is for controlled validation of the analyzer and should not be sent to other people.
