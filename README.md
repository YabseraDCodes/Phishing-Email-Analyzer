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
   <img width="375" height="592" alt="Screenshot 2026-04-09 032705" src="https://github.com/user-attachments/assets/fddc9022-ef75-4ea2-8bbc-fdc7869aaee1" />

9. Confirm that the extension extracts the sender, subject, and body, then review the risk score and findings.
    <img width="1557" height="646" alt="Screenshot 2026-04-09 034444" src="https://github.com/user-attachments/assets/8d7147ac-22d8-41f5-a91b-b3f129eb99f5" />


If you want to test manual mode instead of tab scanning:

1. Open `web/index.html` in Chrome.
2. Click `Load file`.
3. Select `test-assets/sample-phishing.eml`.
   <img width="1318" height="1006" alt="index" src="https://github.com/user-attachments/assets/71bd191c-fd49-46c8-991e-b6b4f1f5a804" />

4. Review the phishing score and extracted indicators.
   <img width="1318" height="1129" alt="_C__Users_Yabsera_Desktop_Projects_Phishing%20mail%20-%20Copy_web_index html (2)" src="https://github.com/user-attachments/assets/9fcf6531-6a2d-4df2-8816-4837a27f286b" />


## Safe test note

Use only your own accounts for testing. The included phishing sample is for controlled validation of the analyzer and should not be sent to other people.
