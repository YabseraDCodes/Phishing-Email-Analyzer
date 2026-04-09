(function (root) {
  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function unique(items) {
    return Array.from(new Set(items));
  }

  function parseDomain(value) {
    if (!value) {
      return "";
    }

    var cleaned = value.toLowerCase().trim();
    cleaned = cleaned.replace(/^mailto:/, "");
    cleaned = cleaned.replace(/^https?:\/\//, "");
    cleaned = cleaned.replace(/^www\./, "");

    if (cleaned.indexOf("@") !== -1) {
      cleaned = cleaned.split("@").pop();
    }

    cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
    return cleaned;
  }

  function extractUrls(text) {
    var matches = text.match(/https?:\/\/[^\s<>()]+|www\.[^\s<>()]+/gi);
    return matches ? unique(matches) : [];
  }

  function extractEmails(text) {
    var matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
    return matches ? unique(matches) : [];
  }

  function scoreLevel(score) {
    if (score >= 70) {
      return "High risk";
    }
    if (score >= 40) {
      return "Medium risk";
    }
    return "Low risk";
  }

  function createFinding(severity, points, title, detail) {
    return {
      severity: severity,
      points: points,
      title: title,
      detail: detail
    };
  }

  function analyzeEmail(payload) {
    payload = payload || {};

    var sender = normalizeText(payload.sender);
    var subject = normalizeText(payload.subject);
    var body = normalizeText(payload.body || payload.content);
    var source = normalizeText(payload.source || "manual");
    var combined = [sender, subject, body].filter(Boolean).join(" ");
    var findings = [];
    var score = 0;

    var urls = extractUrls(combined);
    var emailAddresses = extractEmails(combined);
    var senderDomain = parseDomain(sender);
    var urlDomains = urls.map(parseDomain).filter(Boolean);
    var emailDomains = emailAddresses.map(parseDomain).filter(Boolean);

    var urgentPatterns = [
      /urgent/i,
      /immediately/i,
      /asap/i,
      /act now/i,
      /within \d+ hours?/i,
      /final warning/i,
      /suspend(?:ed|ion)?/i,
      /verify now/i
    ];

    var credentialPatterns = [
      /verify (?:your )?(?:account|identity|login)/i,
      /confirm (?:your )?(?:password|credentials|account)/i,
      /reset (?:your )?password/i,
      /login to/i,
      /sign in to/i,
      /wallet/i,
      /seed phrase/i,
      /2fa code/i,
      /one-time password/i
    ];

    var paymentPatterns = [
      /invoice/i,
      /wire transfer/i,
      /bank account/i,
      /payment failed/i,
      /gift card/i,
      /crypto/i,
      /refund/i,
      /outstanding balance/i,
      /pay now/i
    ];

    var attachmentPatterns = [
      /attached/i,
      /attachment/i,
      /open the file/i,
      /download the document/i,
      /enable editing/i,
      /enable content/i,
      /macro/i,
      /zip file/i
    ];

    if (urgentPatterns.some(function (pattern) { return pattern.test(combined); })) {
      findings.push(createFinding("medium", 15, "Urgency language detected", "The message uses pressure tactics that are common in phishing attempts."));
      score += 15;
    }

    if (credentialPatterns.some(function (pattern) { return pattern.test(combined); })) {
      findings.push(createFinding("high", 22, "Credential request indicators", "The content appears to ask for account access, identity details, or security information."));
      score += 22;
    }

    if (paymentPatterns.some(function (pattern) { return pattern.test(combined); })) {
      findings.push(createFinding("medium", 18, "Payment-related pressure", "The message references money movement or payment issues, which often appear in scams."));
      score += 18;
    }

    if (attachmentPatterns.some(function (pattern) { return pattern.test(combined); })) {
      findings.push(createFinding("medium", 14, "Attachment or document lure", "The content encourages opening a file or enabling document features."));
      score += 14;
    }

    if (/!{2,}|\?{2,}/.test(combined) || /\b(?:dear user|dear customer|valued customer)\b/i.test(combined)) {
      findings.push(createFinding("low", 8, "Generic or exaggerated phrasing", "The tone is broad or overly dramatic instead of personal and specific."));
      score += 8;
    }

    if (/bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|ow\.ly/i.test(combined)) {
      findings.push(createFinding("high", 16, "Shortened link detected", "Short links can hide the real destination and should be treated carefully."));
      score += 16;
    }

    if (urls.length === 0 && /(click here|use the link below|follow this link)/i.test(combined)) {
      findings.push(createFinding("low", 6, "Hidden or missing link context", "The message references a link but does not clearly expose the destination."));
      score += 6;
    }

    if (senderDomain && urlDomains.length > 0) {
      var externalDomains = urlDomains.filter(function (domain) {
        return domain && domain !== senderDomain && domain.indexOf(senderDomain) === -1;
      });

      if (externalDomains.length > 0) {
        findings.push(createFinding("high", 18, "Sender and link domains do not align", "The sender domain differs from one or more linked destinations: " + unique(externalDomains).join(", ")));
        score += 18;
      }
    }

    if (senderDomain && /[0-9]|-|\.co$|\.info$|\.top$|\.xyz$/i.test(senderDomain)) {
      findings.push(createFinding("medium", 10, "Sender domain looks unusual", "The sender domain contains patterns that deserve extra verification: " + senderDomain));
      score += 10;
    }

    if (emailDomains.length > 2) {
      findings.push(createFinding("medium", 10, "Multiple email identities found", "The message references several email domains, which can be a sign of impersonation or redirect chains."));
      score += 10;
    }

    if (/password|ssn|social security|credit card|debit card|cvv|pin\b/i.test(combined)) {
      findings.push(createFinding("high", 20, "Sensitive data request", "The content mentions highly sensitive information that should not be shared by email."));
      score += 20;
    }

    if (source === "page-scan" && body.length > 3000) {
      findings.push(createFinding("low", 5, "Large page scan analyzed", "This result comes from page extraction, so manual review is still recommended for layout cues and sender details."));
      score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    var recommendations = [];
    if (score >= 70) {
      recommendations = [
        "Do not click links, download attachments, or reply to the sender.",
        "Verify the request using an official website or a known contact channel.",
        "Report the message to your security team or mail provider as phishing."
      ];
    } else if (score >= 40) {
      recommendations = [
        "Double-check the sender address and compare linked domains before taking any action.",
        "Open the organization website manually instead of using links in the email.",
        "Treat attachments and requests for credentials as suspicious until verified."
      ];
    } else {
      recommendations = [
        "No strong phishing indicators were found, but continue to verify unfamiliar senders.",
        "Review the sender, links, and intent before sharing information or opening files."
      ];
    }

    return {
      score: score,
      level: scoreLevel(score),
      summary: score >= 70
        ? "Several phishing indicators were detected."
        : score >= 40
          ? "This message has notable warning signs and deserves caution."
          : "Only limited phishing signals were detected from the provided content.",
      findings: findings,
      recommendations: recommendations,
      extracted: {
        senderDomain: senderDomain,
        urls: urls,
        emailAddresses: emailAddresses
      }
    };
  }

  root.PhishingAnalyzerCore = {
    analyzeEmail: analyzeEmail,
    parseDomain: parseDomain,
    extractUrls: extractUrls,
    extractEmails: extractEmails
  };
})(typeof self !== "undefined" ? self : this);
