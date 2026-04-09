function textFromNode(node) {
  return node && node.innerText ? node.innerText.trim() : "";
}

function firstText(selectors) {
  for (var index = 0; index < selectors.length; index += 1) {
    var node = document.querySelector(selectors[index]);
    var text = textFromNode(node);
    if (text) {
      return text;
    }
  }

  return "";
}

function detectProvider() {
  var host = window.location.hostname;
  if (/mail\.google\.com$/i.test(host)) {
    return "gmail";
  }
  if (/outlook\.live\.com$|outlook\.office\.com$|outlook\.office365\.com$/i.test(host)) {
    return "outlook";
  }
  return "generic";
}

function extractGmailDetails() {
  return {
    sender: firstText([
      "h3 [email]",
      "span[email]",
      ".gD[email]",
      ".go span[email]"
    ]),
    subject: firstText([
      "h2[data-thread-perm-id]",
      "h2.hP",
      "div[role='main'] h2"
    ]),
    body: firstText([
      "div[role='listitem'] div.a3s",
      "div.a3s.aiL",
      "div[role='main'] div.a3s"
    ])
  };
}

function extractOutlookDetails() {
  return {
    sender: firstText([
      "[data-app-section='ReadingPane'] [title*='@']",
      "[aria-label*='From'] [title*='@']",
      "[data-app-section='ReadingPane'] span[title*='@']"
    ]),
    subject: firstText([
      "[data-app-section='ReadingPane'] [role='heading']",
      "[aria-label='Message header'] [role='heading']"
    ]),
    body: firstText([
      "[data-app-section='ReadingPane'] [role='document']",
      "[aria-label='Message body']",
      ".ReadingPaneContainer [role='document']"
    ])
  };
}

function extractGenericDetails() {
  var mailto = document.querySelector('a[href^="mailto:"]');
  var sender = "";
  if (mailto) {
    sender = mailto.getAttribute("href").replace(/^mailto:/, "");
  }

  if (!sender) {
    var pageText = document.body ? document.body.innerText : "";
    var emailMatch = pageText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    sender = emailMatch ? emailMatch[0] : "";
  }

  return {
    sender: sender,
    subject: firstText(["h1", "h2", "title"]) || document.title || "",
    body: firstText(["main", "article", "[role='main']", ".message", ".email", ".mail", "body"])
  };
}

function collectScanData() {
  var provider = detectProvider();
  var extracted;

  if (provider === "gmail") {
    extracted = extractGmailDetails();
  } else if (provider === "outlook") {
    extracted = extractOutlookDetails();
  } else {
    extracted = extractGenericDetails();
  }

  if (!extracted.body) {
    extracted = extractGenericDetails();
  }

  return {
    provider: provider,
    sender: (extracted.sender || "").slice(0, 320),
    subject: (extracted.subject || "").slice(0, 500),
    body: (extracted.body || "").slice(0, 12000)
  };
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!message || message.type !== "SCAN_PAGE") {
    return;
  }

  sendResponse(collectScanData());
});
